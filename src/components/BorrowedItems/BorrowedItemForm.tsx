import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, Autocomplete, Modal, ModalBody, ModalFooter } from '@/components/UI';
import { BorrowedItem, CreateBorrowedItemData, UpdateBorrowedItemData, borrowedItemsService } from '@/services/borrowedItems';
import { User, groupsService } from '@/services/groups';
import styles from '@/styles/components/ItemForm.module.css';

interface BorrowedItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: BorrowedItem) => void;
  item?: BorrowedItem | null;
  mode: 'create' | 'edit';
  formTitle?: string;
}

const BorrowedItemForm: React.FC<BorrowedItemFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item,
  mode,
  formTitle
}) => {
  const [formData, setFormData] = useState<CreateBorrowedItemData>({
    name: '',
    description: '',
    borrowed_from_name: '',
    borrowed_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Initialize form with item data when editing
  useEffect(() => {
    if (mode === 'edit' && item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        borrowed_from_name: item.borrowed_from_name,
        borrowed_date: item.borrowed_date,
        due_date: item.due_date || '',
        notes: item.notes || ''
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        borrowed_from_name: '',
        borrowed_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: ''
      });
    }
    setErrors({});
  }, [mode, item, isOpen]);

  // Load group members when form opens
  useEffect(() => {
    if (isOpen) {
      loadGroupMembers();
    }
  }, [isOpen]);

  const loadGroupMembers = async () => {
    setLoadingMembers(true);
    try {
      const result = await groupsService.getAllGroupMembers();
      if (result.error) {
        console.error('Error loading group members:', result.error);
        setErrors(prev => ({ ...prev, members: result.error || 'Unknown error' }));
      } else {
        setGroupMembers(result.data || []);
      }
    } catch (error) {
      console.error('Error loading group members:', error);
      setErrors(prev => ({ ...prev, members: 'Failed to load group members' }));
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleInputChange = (field: keyof CreateBorrowedItemData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.borrowed_from_name.trim()) {
      newErrors.borrowed_from_name = 'Lender name is required';
    }

    if (!formData.borrowed_date) {
      newErrors.borrowed_date = 'Borrowed date is required';
    }

    if (formData.due_date && formData.borrowed_date) {
      const borrowedDate = new Date(formData.borrowed_date);
      const dueDate = new Date(formData.due_date);
      if (dueDate <= borrowedDate) {
        newErrors.due_date = 'Due date must be after borrowed date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result;

      // Clean the form data - convert empty strings to undefined for optional fields
      const cleanedData = {
        ...formData,
        description: formData.description?.trim() || undefined,
        due_date: formData.due_date?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      if (mode === 'create') {
        result = await borrowedItemsService.createBorrowedItem(cleanedData);
      } else if (item) {
        const updates: UpdateBorrowedItemData = { ...cleanedData };
        result = await borrowedItemsService.updateBorrowedItem(item.id, updates);
      }

      if (result?.error) {
        setErrors({ submit: result.error });
      } else if (result?.data) {
        onSuccess(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={formTitle || (mode === 'create' ? 'Add Borrowed Item' : 'Edit Borrowed Item')}
      size="lg"
      closeOnOverlayClick={!loading}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <ModalBody>
          {errors.submit && (
            <div className={styles.errorMessage}>
              {errors.submit}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <Input
                label="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="e.g., The Great Gatsby, Power Drill, etc."
                required
                disabled={loading}
              />
            </div>


            <div className={styles.formGroup}>
              <Autocomplete
                label="Borrowed From"
                value={formData.borrowed_from_name}
                onChange={(value) => handleInputChange('borrowed_from_name', value)}
                options={groupMembers.map(member => ({
                  id: member.id,
                  name: member.name,
                  email: member.email
                }))}
                error={errors.borrowed_from_name}
                placeholder="Select from your group members"
                required
                disabled={loading}
                loading={loadingMembers}
                helperText="Only members from your groups can be selected"
              />
            </div>


            <div className={styles.formGroup}>
              <Input
                label="Borrowed Date"
                type="date"
                value={formData.borrowed_date}
                onChange={(e) => handleInputChange('borrowed_date', e.target.value)}
                error={errors.borrowed_date}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                label="Due Date (Optional)"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                error={errors.due_date}
                helperText="Leave empty if no specific due date"
                disabled={loading}
              />
            </div>

            <div className={styles.formGroupFull}>
              <Textarea
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the item"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroupFull}>
              <Textarea
                label="Notes (Optional)"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes or conditions"
                rows={3}
                disabled={loading}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {mode === 'create' ? 'Add Item' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default BorrowedItemForm;
