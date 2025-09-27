import React, { useState } from 'react';
import GroupsList from '@/components/Groups/GroupsList';
import GroupForm from '@/components/Groups/GroupForm';
import { Group } from '@/services/groups';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/pages/ItemsPage.module.css';

const GroupsPage: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddGroup = () => {
    setEditingGroup(null);
    setShowForm(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGroup(null);
  };

  const handleFormSuccess = () => {
    // Trigger refresh of the groups list
    setRefreshTrigger(prev => prev + 1);
    setShowForm(false);
    setEditingGroup(null);
  };

  if (!user) {
    return (
      <div className={styles.authRequired}>
        <div className={styles.authMessage}>
          <h2>Authentication Required</h2>
          <p>Please sign in to manage your groups.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <GroupsList
          onAddGroup={handleAddGroup}
          onEditGroup={handleEditGroup}
          refreshTrigger={refreshTrigger}
        />

        <GroupForm
          isOpen={showForm}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          group={editingGroup}
          mode={editingGroup ? 'edit' : 'create'}
        />
      </div>
    </div>
  );
};

export default GroupsPage;
