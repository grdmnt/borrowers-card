import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge, Modal, ModalBody, ModalFooter } from '@/components/UI';
import { Group, groupsService } from '@/services/groups';
import InviteLinkModal from './InviteLinkModal';
import styles from '@/styles/components/ItemCard.module.css';

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onUpdate: (group: Group) => void;
  onDelete: (groupId: string) => void;
  currentUserId?: string;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onEdit,
  onUpdate,
  onDelete,
  currentUserId
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = group.user_role === 'admin';
  const isMember = group.is_member;
  const isCreator = group.created_by === currentUserId;

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle join group
  const handleJoin = async () => {
    setLoading(true);
    try {
      const result = await groupsService.joinGroup(group.id);
      if (result.error) {
        console.error('Error joining group:', result.error);
      } else {
        // Update the group to show as joined
        onUpdate({ ...group, is_member: true, user_role: 'member' });
      }
    } catch (error) {
      console.error('Error joining group:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle leave group
  const handleLeave = async () => {
    setLoading(true);
    try {
      const result = await groupsService.leaveGroup(group.id);
      if (result.error) {
        console.error('Error leaving group:', result.error);
      } else {
        onUpdate({ ...group, is_member: false, user_role: undefined });
        setShowLeaveModal(false);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete group
  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await groupsService.deleteGroup(group.id);
      if (result.error) {
        console.error('Error deleting group:', result.error);
      } else {
        onDelete(group.id);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card 
        variant="elevated" 
        hover 
        className={styles.itemCard}
      >
        <CardHeader>
          <div className={styles.cardHeaderContent}>
            <div className={styles.titleSection}>
              <CardTitle className={styles.itemTitle}>
                <span className={styles.categoryIcon}>
                  👥
                </span>
                {group.name}
              </CardTitle>
              <div className={styles.statusSection}>
                {group.is_public ? (
                  <Badge variant="success" size="sm">Public</Badge>
                ) : (
                  <Badge variant="secondary" size="sm">Private</Badge>
                )}
                {isAdmin && (
                  <Badge variant="primary" size="sm">Admin</Badge>
                )}
                {isMember && !isAdmin && (
                  <Badge variant="info" size="sm">Member</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className={styles.itemDetails}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Members:</span>
              <span className={styles.value}>{group.member_count || 0}</span>
            </div>
            
            <div className={styles.detailRow}>
              <span className={styles.label}>Created:</span>
              <span className={styles.value}>{formatDate(group.created_at)}</span>
            </div>

            {group.description && (
              <div className={styles.description}>
                <span className={styles.label}>Description:</span>
                <p className={styles.descriptionText}>{group.description}</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className={styles.cardActions}>
            {!isMember && group.is_public && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleJoin}
                loading={loading}
                disabled={loading}
              >
                Join Group
              </Button>
            )}

            {isMember && (
              <>
                {isAdmin && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(group)}
                      disabled={loading}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInviteModal(true)}
                      disabled={loading}
                    >
                      Invite Members
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLeaveModal(true)}
                  disabled={loading}
                >
                  {isCreator ? 'Delete Group' : 'Leave Group'}
                </Button>
              </>
            )}

            {isAdmin && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={loading}
              >
                Delete
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Leave/Delete Confirmation Modal */}
      <Modal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        title={isCreator ? "Delete Group" : "Leave Group"}
        size="sm"
      >
        <ModalBody>
          <p>
            {isCreator 
              ? `Are you sure you want to delete "${group.name}"? This action cannot be undone.`
              : `Are you sure you want to leave "${group.name}"?`
            }
          </p>
          {isCreator && (
            <p className={styles.modalWarning}>
              All group members will be removed and group data will be lost.
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setShowLeaveModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={isCreator ? handleDelete : handleLeave}
            loading={loading}
            disabled={loading}
          >
            {isCreator ? 'Delete Group' : 'Leave Group'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Group"
        size="sm"
      >
        <ModalBody>
          <p>Are you sure you want to delete "{group.name}"?</p>
          <p className={styles.modalWarning}>
            This action cannot be undone. All members will be removed.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            disabled={loading}
          >
            Delete Group
          </Button>
        </ModalFooter>
      </Modal>

      {/* Invite Members Modal */}
      <InviteLinkModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        group={group}
      />
    </>
  );
};

export default GroupCard;
