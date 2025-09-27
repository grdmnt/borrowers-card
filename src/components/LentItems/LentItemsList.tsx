import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Loading, Badge } from '@/components/UI';
import BorrowedItemCard from '../BorrowedItems/BorrowedItemCard';
import { BorrowedItem, BorrowedItemsFilters, BorrowedItemsSort, borrowedItemsService } from '@/services/borrowedItems';
import styles from '@/styles/components/ItemsList.module.css';

interface LentItemsListProps {
  onAddItem: () => void;
  onEditItem: (item: BorrowedItem) => void;
  refreshTrigger?: number;
  listTitle?: string;
  addButtonText?: string;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateButtonText?: string;
  searchPlaceholder?: string;
}

const LentItemsList: React.FC<LentItemsListProps> = ({
  onAddItem,
  onEditItem,
  refreshTrigger,
  listTitle = 'Your Lent Items',
  addButtonText = 'Add Lent Item',
  emptyStateTitle = 'No Lent Items Found',
  emptyStateMessage = 'Start by adding your first lent item to keep track of things you\'ve lent to others.',
  emptyStateButtonText = 'Add Your First Lent Item',
  searchPlaceholder = 'Search items, descriptions, or borrowers...'
}) => {
  const [items, setItems] = useState<BorrowedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BorrowedItemsFilters>({});
  const [sort, setSort] = useState<BorrowedItemsSort>({ field: 'borrowed_date', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');

  // Filter options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'returned', label: 'Returned' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const sortOptions = [
    { value: 'borrowed_date:desc', label: 'Newest First' },
    { value: 'borrowed_date:asc', label: 'Oldest First' },
    { value: 'name:asc', label: 'Name A-Z' },
    { value: 'name:desc', label: 'Name Z-A' },
    { value: 'due_date:asc', label: 'Due Date (Earliest)' },
    { value: 'due_date:desc', label: 'Due Date (Latest)' }
  ];

  // Load items
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchFilters: BorrowedItemsFilters = {
        ...filters,
        search: searchTerm || undefined
      };

      const { data, error: fetchError } = await borrowedItemsService.getLentItems(searchFilters, sort);
      
      if (fetchError) {
        setError(fetchError);
        return;
      }

      setItems(data || []);
    } catch (err) {
      setError('Failed to load lent items');
      console.error('Error loading lent items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load items on mount and when dependencies change
  useEffect(() => {
    loadItems();
  }, [filters, sort, searchTerm, refreshTrigger]);

  // Handle filter changes
  const handleStatusFilter = (value: string) => {
    const statuses = value ? [value as BorrowedItem['status']] : undefined;
    setFilters(prev => ({ ...prev, status: statuses }));
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split(':') as [keyof BorrowedItem, 'asc' | 'desc'];
    setSort({ field, direction });
  };

  const handleOverdueFilter = () => {
    setFilters(prev => ({
      ...prev,
      overdue: !prev.overdue
    }));
  };

  // Calculate counts
  const counts = {
    total: items.length,
    active: items.filter(item => item.status === 'active').length,
    returned: items.filter(item => item.status === 'returned').length,
    overdue: items.filter(item => {
      if (item.status !== 'active' || !item.due_date) return false;
      return new Date(item.due_date) < new Date();
    }).length,
    lost: items.filter(item => item.status === 'lost').length
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" />
        <p>Loading your lent items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h3>Error Loading Lent Items</h3>
          <p>{error}</p>
          <Button variant="ghost" size="sm" onClick={loadItems}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {/* Header with Add Button and Stats */}
      <div className={styles.listHeader}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h2 className={styles.listTitle}>{listTitle}</h2>
            <div className={styles.statsSection}>
              <Badge variant="info" size="sm">{counts.total} total</Badge>
              <Badge variant="success" size="sm">{counts.active} active</Badge>
              {counts.overdue > 0 && (
                <Badge variant="error" size="sm">{counts.overdue} overdue</Badge>
              )}
              <Badge variant="secondary" size="sm">{counts.returned} returned</Badge>
              {counts.lost > 0 && (
                <Badge variant="secondary" size="sm">{counts.lost} lost</Badge>
              )}
            </div>
          </div>
          <Button
            variant="primary"
            onClick={onAddItem}
            icon="+"
            className={styles.addButton}
          >
            {addButtonText}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersRow}>
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon="🔍"
            className={styles.searchInput}
          />

          <Select
            options={statusOptions}
            value={filters.status?.[0] || ''}
            onChange={(e) => handleStatusFilter(e.target.value)}
            placeholder="Filter by status"
            className={styles.filterSelect}
          />

          <Select
            options={sortOptions}
            value={`${sort.field}:${sort.direction}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className={styles.sortSelect}
          />

          <Button
            variant={filters.overdue ? 'danger' : 'outline'}
            size="sm"
            onClick={handleOverdueFilter}
            className={styles.overdueFilter}
          >
            {filters.overdue ? 'Show All' : 'Overdue Only'}
          </Button>
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 && !loading ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h3 className={styles.emptyTitle}>{emptyStateTitle}</h3>
          <p className={styles.emptyDescription}>
            {Object.keys(filters).length > 0 || searchTerm
              ? emptyStateMessage
              : emptyStateMessage}
          </p>
          {Object.keys(filters).length === 0 && !searchTerm && (
            <Button variant="primary" onClick={onAddItem} className={styles.emptyAction}>
              {emptyStateButtonText}
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.itemsGrid}>
          {items.map((item) => (
            <BorrowedItemCard
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onUpdate={loadItems}
              onDelete={loadItems}
              perspective="lender"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LentItemsList;
