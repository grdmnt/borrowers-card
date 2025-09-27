import React, { useState } from 'react';
import { Button, Input, Modal, ModalBody, ModalFooter, Loading } from '@/components/UI';
import { Group, User, groupsService } from '@/services/groups';
import styles from '@/styles/components/ItemForm.module.css';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onSuccess: () => void;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  group,
  onSuccess
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search for users
  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const result = await groupsService.searchUsers(query);
      if (result.error) {
        setError(result.error);
      } else {
        setSearchResults(result.data || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  // Invite user to group
  const handleInvite = async (userId: string) => {
    setInviting(userId);
    setError(null);

    try {
      const result = await groupsService.inviteToGroup(group.id, userId);
      if (result.error) {
        setError(result.error);
      } else {
        // Remove user from search results
        setSearchResults(prev => prev.filter(user => user.id !== userId));
        onSuccess();
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      setError('Failed to invite user');
    } finally {
      setInviting(null);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Invite Members to ${group.name}`}
      size="md"
    >
      <ModalBody>
        <div className={styles.formGroup}>
          <Input
            label="Search Users"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email..."
            leftIcon="🔍"
          />
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Loading size="sm" variant="spinner" />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
              Search Results:
            </h4>
            {searchResults.map((user) => (
              <div key={user.id} className={styles.userResult}>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.name}</div>
                  <div className={styles.userEmail}>{user.email}</div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleInvite(user.id)}
                  loading={inviting === user.id}
                  disabled={!!inviting}
                >
                  Invite
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchTerm.length >= 2 && !loading && searchResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No users found matching "{searchTerm}"
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
            💡 Tip: How to Add People
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.4' }}>
            <li><strong>Public Groups:</strong> Anyone can search and join</li>
            <li><strong>Private Groups:</strong> Use this search to invite specific people</li>
            <li><strong>Share Group Name:</strong> Tell people the exact group name to search for</li>
          </ul>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          Done
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default InviteMemberModal;
