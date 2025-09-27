import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge, StatusBadge, Modal, ModalBody, ModalFooter } from '@/components/UI';
import { BorrowedItem, borrowedItemsService } from '@/services/borrowedItems';
import styles from '@/styles/components/ItemCard.module.css';

interface BorrowedItemCardProps {
  item: BorrowedItem;
  onEdit: (item: BorrowedItem) => void;
  onUpdate: (item: BorrowedItem) => void;
  onDelete: (itemId: string) => void;
}

const BorrowedItemCard: React.FC<BorrowedItemCardProps> = ({
  item,
  onEdit,
  onUpdate,
  onDelete
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate if item is overdue
  const isOverdue = item.status === 'active' && item.due_date && new Date(item.due_date) < new Date();
  
  // Calculate days until due or days overdue
  const getDaysInfo = () => {
    if (!item.due_date || item.status !== 'active') return null;
    
    const today = new Date();
    const dueDate = new Date(item.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { type: 'overdue', days: Math.abs(diffDays) };
    } else if (diffDays <= 7) {
      return { type: 'due-soon', days: diffDays };
    }
    return { type: 'normal', days: diffDays };
  };

  const daysInfo = getDaysInfo();

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  // Handle return item
  const handleReturn = async () => {
    setLoading(true);
    try {
      const result = await borrowedItemsService.returnBorrowedItem(item.id);
      if (result.error) {
        console.error('Error returning item:', result.error);
      } else if (result.data) {
        onUpdate(result.data);
        setShowReturnModal(false);
      }
    } catch (error) {
      console.error('Error returning item:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle mark as lost
  const handleMarkAsLost = async () => {
    setLoading(true);
    try {
      const result = await borrowedItemsService.markItemAsLost(item.id);
      if (result.error) {
        console.error('Error marking item as lost:', result.error);
      } else if (result.data) {
        onUpdate(result.data);
      }
    } catch (error) {
      console.error('Error marking item as lost:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete item
  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await borrowedItemsService.deleteBorrowedItem(item.id);
      if (result.error) {
        console.error('Error deleting item:', result.error);
      } else {
        onDelete(item.id);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card 
        variant="elevated" 
        hover 
        className={`${styles.itemCard} ${isOverdue ? styles.overdue : ''}`}
      >
        <CardHeader>
          <div className={styles.cardHeaderContent}>
            <div className={styles.titleSection}>
              <CardTitle className={styles.itemTitle}>
                <span className={styles.categoryIcon}>
                  📦
                </span>
                {item.name}
              </CardTitle>
              <div className={styles.statusSection}>
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className={styles.itemDetails}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Borrowed from:</span>
              <span className={styles.value}>{item.borrowed_from_name}</span>
            </div>
            
            <div className={styles.detailRow}>
              <span className={styles.label}>Borrowed on:</span>
              <span className={styles.value}>{formatDate(item.borrowed_date)}</span>
            </div>

            {item.due_date && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Due date:</span>
                <span className={`${styles.value} ${isOverdue ? styles.overdueText : ''}`}>
                  {formatDate(item.due_date)}
                  {daysInfo && (
                    <span className={styles.daysInfo}>
                      {daysInfo.type === 'overdue' && (
                        <Badge variant="error" size="sm">
                          {daysInfo.days} days overdue
                        </Badge>
                      )}
                      {daysInfo.type === 'due-soon' && (
                        <Badge variant="warning" size="sm">
                          Due in {daysInfo.days} days
                        </Badge>
                      )}
                    </span>
                  )}
                </span>
              </div>
            )}

            {item.returned_date && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Returned on:</span>
                <span className={styles.value}>{formatDate(item.returned_date)}</span>
              </div>
            )}


            {item.description && (
              <div className={styles.description}>
                <span className={styles.label}>Description:</span>
                <p className={styles.descriptionText}>{item.description}</p>
              </div>
            )}

            {item.notes && (
              <div className={styles.description}>
                <span className={styles.label}>Notes:</span>
                <p className={styles.descriptionText}>{item.notes}</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className={styles.cardActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              disabled={loading}
            >
              Edit
            </Button>

            {item.status === 'active' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowReturnModal(true)}
                  disabled={loading}
                >
                  Mark Returned
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAsLost}
                  loading={loading}
                  disabled={loading}
                >
                  Mark Lost
                </Button>
              </>
            )}

            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
            >
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Return Confirmation Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="Mark Item as Returned"
        size="sm"
      >
        <ModalBody>
          <p>Are you sure you want to mark "{item.name}" as returned?</p>
          <p className={styles.modalNote}>
            This will update the item status and set today as the return date.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setShowReturnModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReturn}
            loading={loading}
            disabled={loading}
          >
            Mark Returned
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Item"
        size="sm"
      >
        <ModalBody>
          <p>Are you sure you want to delete "{item.name}"?</p>
          <p className={styles.modalWarning}>
            This action cannot be undone.
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
            Delete Item
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default BorrowedItemCard;
