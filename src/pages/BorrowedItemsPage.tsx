import React, { useState } from 'react';
import BorrowedItemsList from '@/components/BorrowedItems/BorrowedItemsList';
import BorrowedItemForm from '@/components/BorrowedItems/BorrowedItemForm';
import { BorrowedItem } from '@/services/borrowedItems';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/pages/ItemsPage.module.css';

const BorrowedItemsPage: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BorrowedItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item: BorrowedItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSuccess = () => {
    // Trigger refresh of the items list
    setRefreshTrigger(prev => prev + 1);
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
              <p>Please sign in to manage your borrowed items.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <BorrowedItemsList
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          refreshTrigger={refreshTrigger}
        />

        <BorrowedItemForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          item={editingItem}
          mode={editingItem ? 'edit' : 'create'}
        />
      </div>
    </div>
  );
};

export default BorrowedItemsPage;
