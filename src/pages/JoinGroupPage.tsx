import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/UI';
import { Group, groupsService } from '@/services/groups';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from '@/styles/pages/ItemsPage.module.css';

const JoinGroupPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load group info when component mounts
  useEffect(() => {
    if (groupId) {
      loadGroupInfo();
    }
  }, [groupId]);

  // Auto-join if user is authenticated
  useEffect(() => {
    if (user && group && !success && !error) {
      handleJoinGroup();
    }
  }, [user, group]);

  const loadGroupInfo = async () => {
    if (!groupId) {
      setError('Invalid invite link');
      setLoading(false);
      return;
    }

    try {
      // For non-authenticated users, we need to get group info differently
      // Let's use a direct Supabase query that doesn't require authentication
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError || !groupData) {
        setError('Group not found or invite link is invalid');
        setLoading(false);
        return;
      }

      // Get member count
      const { data: memberCount } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('is_active', true);

      const processedGroup: Group = {
        id: (groupData as any).id,
        name: (groupData as any).name,
        description: (groupData as any).description,
        is_public: (groupData as any).is_public,
        created_by: (groupData as any).created_by,
        created_at: (groupData as any).created_at,
        updated_at: (groupData as any).updated_at,
        member_count: memberCount?.length || 0,
        is_member: false,
        user_role: undefined
      };

      setGroup(processedGroup);

      // If user is authenticated, check if they're already a member
      if (user) {
        const result = await groupsService.getGroup(groupId);
        if (result.data?.is_member) {
          setSuccess(true);
          setTimeout(() => navigate('/groups'), 2000);
        }
      }
    } catch (error) {
      console.error('Error loading group:', error);
      setError('Failed to load group information');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupId || !user) return;

    setJoining(true);
    setError(null);

    try {
      const result = await groupsService.joinGroupViaInvite(groupId);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/groups'), 2000);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      setError('Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const handleSignIn = async () => {
    try {
      // Update the redirect URL to come back to this invite page
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/join-group/${groupId}`,
        },
      });
      
      if (error) {
        console.error('Error signing in:', error);
        setError('Failed to sign in');
      }
      // After sign in, the user will be redirected back to this page and auto-join
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in');
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Loading size="lg" variant="spinner" text="Loading group information..." />
          </div>
        </div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className={styles.pageContainer}>
          <div className={styles.pageContent}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <Card className={styles.inviteCard}>
                <CardContent>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                  <h2 style={{ color: '#d32f2f', marginBottom: '8px' }}>Invalid Invite Link</h2>
                  <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
                  <Button variant="primary" onClick={() => navigate('/groups')}>
                    Go to Groups
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    );
  }

  if (success) {
    return (
      <div className={styles.pageContainer}>
          <div className={styles.pageContent}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <Card className={styles.inviteCard}>
                <CardContent>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                  <h2 style={{ color: '#4caf50', marginBottom: '8px' }}>Welcome to the Group!</h2>
                  <p style={{ color: '#666', marginBottom: '20px' }}>
                    You've successfully joined <strong>{group?.name}</strong>
                  </p>
                  <p style={{ fontSize: '14px', color: '#999' }}>
                    Redirecting to groups page...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Card className={styles.inviteCard}>
            <CardHeader>
              <CardTitle>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                Join Group Invitation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group && (
                <>
                  <h3>{group.name}</h3>
                  {group.description && (
                    <p>{group.description}</p>
                  )}
                  <div className={styles.groupStats}>
                    <span>👤 {group.member_count || 0} members</span>
                    <span>{group.is_public ? '🌐 Public' : '🔒 Private'}</span>
                  </div>
                </>
              )}

              {error && (
                <div style={{ color: '#d32f2f', marginBottom: '16px', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              {!user ? (
                <>
                  <p className={styles.signInPrompt}>
                    Sign in to join this group
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleSignIn}
                    style={{ width: '100%' }}
                  >
                    Sign in with Google
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleJoinGroup}
                  loading={joining}
                  disabled={joining}
                  style={{ width: '100%' }}
                >
                  {joining ? 'Joining...' : `Join ${group?.name}`}
                </Button>
              )}

              <div className={styles.disclaimer}>
                <p>By joining, you'll be able to participate in group activities and see shared items.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JoinGroupPage;
