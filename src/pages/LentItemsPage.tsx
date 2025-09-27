import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LentItemsList from '@/components/LentItems/LentItemsList';
import BorrowedItemForm from '@/components/BorrowedItems/BorrowedItemForm';
import { BorrowedItem } from '@/services/borrowedItems';
import styles from '@/styles/pages/ItemsPage.module.css';

const LentItemsPage: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BorrowedItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle adding new item
  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  // Handle editing existing item
  const handleEditItem = (item: BorrowedItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // Handle form success (item created/updated)
  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowForm(false);
    setEditingItem(null);
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  if (!user) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <div className={styles.authRequired}>
            <div className={styles.authMessage}>
              <h2>Authentication Required</h2>
              <p>Please sign in to view your lent items.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <LentItemsList
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          refreshTrigger={refreshTrigger}
        />

        <BorrowedItemForm
          isOpen={showForm}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          item={editingItem}
          mode={editingItem ? 'edit' : 'create'}
          formTitle={editingItem ? 'Edit Lent Item' : 'Add Lent Item'}
        />
      </div>
    </div>
  );
};
export default LentItemsPage;
