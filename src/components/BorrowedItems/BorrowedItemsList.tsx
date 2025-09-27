import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Loading, Badge } from '@/components/UI';
import BorrowedItemCard from './BorrowedItemCard';
import { BorrowedItem, BorrowedItemsFilters, BorrowedItemsSort, borrowedItemsService } from '@/services/borrowedItems';
import styles from '@/styles/components/ItemsList.module.css';

interface BorrowedItemsListProps {
  onAddItem: () => void;
  onEditItem: (item: BorrowedItem) => void;
  refreshTrigger?: number; // Used to trigger refresh from parent
  listTitle?: string;
  addButtonText?: string;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateButtonText?: string;
}

const BorrowedItemsList: React.FC<BorrowedItemsListProps> = ({
  onAddItem,
  onEditItem,
  refreshTrigger,
  listTitle = 'Your Borrowed Items',
  addButtonText = 'Add Borrowed Item',
  emptyStateTitle = 'No Borrowed Items Found',
  emptyStateMessage = 'Try adjusting your filters or search terms.',
  emptyStateButtonText = 'Add Your First Borrowed Item'
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
    { value: 'overdue', label: 'Overdue' },
    { value: 'lost', label: 'Lost' }
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
    setLoading(true);
    setError(null);

    try {
      const result = await borrowedItemsService.getBorrowedItems(filters, sort);
      if (result.error) {
        setError(result.error);
      } else {
        setItems(result.data || []);
      }
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Failed to load borrowed items');
    } finally {
      setLoading(false);
    }
  };

  // Load items on mount and when filters/sort change
  useEffect(() => {
    loadItems();
  }, [filters, sort, refreshTrigger]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle filter changes
  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status ? [status as BorrowedItem['status']] : undefined
    }));
  };


  const handleSortChange = (sortValue: string) => {
    const [field, direction] = sortValue.split(':');
    setSort({
      field: field as BorrowedItemsSort['field'],
      direction: direction as 'asc' | 'desc'
    });
  };

  const handleOverdueFilter = () => {
    setFilters(prev => ({
      ...prev,
      overdue: !prev.overdue
    }));
  };

  // Handle item updates
  const handleItemUpdate = (updatedItem: BorrowedItem) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleItemDelete = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Get filtered item counts
  const getItemCounts = () => {
    const active = items.filter(item => item.status === 'active').length;
    const returned = items.filter(item => item.status === 'returned').length;
    const overdue = items.filter(item => 
      item.status === 'active' && item.due_date && new Date(item.due_date) < new Date()
    ).length;
    const lost = items.filter(item => item.status === 'lost').length;

    return { active, returned, overdue, lost, total: items.length };
  };

  const counts = getItemCounts();

  if (loading && items.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" variant="spinner" text="Loading borrowed items..." />
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
        <div className={styles.searchRow}>
          <Input
            placeholder="Search items, descriptions, or lenders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon="🔍"
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersRow}>
          <Select
            options={statusOptions}
            value={filters.status?.[0] || ''}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className={styles.filterSelect}
          />


          <Select
            options={sortOptions}
            value={`${sort.field}:${sort.direction}`}
            onChange={(e) => handleSortChange(e.target.value)}
            className={styles.filterSelect}
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

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <span>⚠ {error}</span>
          <Button variant="ghost" size="sm" onClick={loadItems}>
            Retry
          </Button>
        </div>
      )}

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
              onUpdate={handleItemUpdate}
              onDelete={handleItemDelete}
            />
          ))}
        </div>
      )}

      {/* Loading overlay for refresh */}
      {loading && items.length > 0 && (
        <div className={styles.refreshOverlay}>
          <Loading size="sm" variant="spinner" />
        </div>
      )}
    </div>
  );
};

export default BorrowedItemsList;
