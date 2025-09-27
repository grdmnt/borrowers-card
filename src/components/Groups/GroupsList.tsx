import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Loading, Badge } from '@/components/UI';
import GroupCard from './GroupCard';
import { Group, GroupsFilters, groupsService, User } from '@/services/groups';
import styles from '@/styles/components/ItemsList.module.css';

interface GroupsListProps {
  onAddGroup: () => void;
  onEditGroup: (group: Group) => void;
  refreshTrigger?: number; // Used to trigger refresh from parent
}

const GroupsList: React.FC<GroupsListProps> = ({
  onAddGroup,
  onEditGroup,
  refreshTrigger
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GroupsFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options
  const viewOptions = [
    { value: '', label: 'All Groups' },
    { value: 'my_groups', label: 'My Groups' },
    { value: 'public', label: 'Public Groups' },
    { value: 'private', label: 'Private Groups' }
  ];

  // Load groups and current user
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user first
      const userResult = await groupsService.getCurrentUser();
      if (userResult.error) {
        setError(userResult.error);
        return;
      }
      setCurrentUser(userResult.data);

      // Get groups
      const groupsResult = await groupsService.getGroups(filters);
      if (groupsResult.error) {
        setError(groupsResult.error);
      } else {
        setGroups(groupsResult.data || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadData();
  }, [filters, refreshTrigger]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle view filter changes
  const handleViewFilter = (view: string) => {
    switch (view) {
      case 'my_groups':
        setFilters(prev => ({ ...prev, my_groups_only: true, is_public: undefined }));
        break;
      case 'public':
        setFilters(prev => ({ ...prev, my_groups_only: false, is_public: true }));
        break;
      case 'private':
        setFilters(prev => ({ ...prev, my_groups_only: false, is_public: false }));
        break;
      default:
        setFilters(prev => ({ ...prev, my_groups_only: false, is_public: undefined }));
    }
  };

  // Handle group updates
  const handleGroupUpdate = (updatedGroup: Group) => {
    setGroups(prev => prev.map(group => 
      group.id === updatedGroup.id ? updatedGroup : group
    ));
  };

  const handleGroupDelete = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  };

  // Get filtered group counts
  const getGroupCounts = () => {
    const myGroups = groups.filter(group => group.is_member).length;
    const publicGroups = groups.filter(group => group.is_public).length;
    const adminGroups = groups.filter(group => group.user_role === 'admin').length;

    return { myGroups, publicGroups, adminGroups, total: groups.length };
  };

  const counts = getGroupCounts();

  if (loading && groups.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" variant="spinner" text="Loading groups..." />
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {/* Header with Add Button and Stats */}
      <div className={styles.listHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h2 className={styles.listTitle}>Groups</h2>
            <div className={styles.statsSection}>
              <Badge variant="info" size="sm">{counts.total} total</Badge>
              <Badge variant="success" size="sm">{counts.myGroups} joined</Badge>
              <Badge variant="primary" size="sm">{counts.adminGroups} admin</Badge>
              <Badge variant="secondary" size="sm">{counts.publicGroups} public</Badge>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={onAddGroup}
            icon="+"
            className={styles.addButton}
          >
            Create Group
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchRow}>
          <Input
            placeholder="Search groups by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon="🔍"
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersRow}>
          <Select
            options={viewOptions}
            value={
              filters.my_groups_only ? 'my_groups' :
              filters.is_public === true ? 'public' :
              filters.is_public === false ? 'private' : ''
            }
            onChange={(e) => handleViewFilter(e.target.value)}
            className={styles.filterSelect}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <span>⚠ {error}</span>
          <Button variant="ghost" size="sm" onClick={loadData}>
            Retry
          </Button>
        </div>
      )}

      {/* Groups Grid */}
      {groups.length === 0 && !loading ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <h3 className={styles.emptyTitle}>No groups found</h3>
          <p className={styles.emptyDescription}>
            {Object.keys(filters).length > 0 || searchTerm
              ? 'Try adjusting your filters or search terms.'
              : 'Create your first group to start collaborating with others.'}
          </p>
          {Object.keys(filters).length === 0 && !searchTerm && (
            <Button variant="primary" onClick={onAddGroup} className={styles.emptyAction}>
              Create Your First Group
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={onEditGroup}
              onUpdate={handleGroupUpdate}
              onDelete={handleGroupDelete}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      )}

      {/* Loading overlay for refresh */}
      {loading && groups.length > 0 && (
        <div className={styles.refreshOverlay}>
          <Loading size="sm" variant="spinner" />
        </div>
      )}
    </div>
  );
};

export default GroupsList;
