import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, Modal, ModalBody, ModalFooter } from '@/components/UI';
import { Group, CreateGroupData, UpdateGroupData, groupsService } from '@/services/groups';
import styles from '@/styles/components/ItemForm.module.css';

interface GroupFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (group: Group) => void;
  group?: Group | null;
  mode: 'create' | 'edit';
}

const GroupForm: React.FC<GroupFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  group,
  mode
}) => {
  const [formData, setFormData] = useState<CreateGroupData>({
    name: '',
    description: '',
    is_public: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with group data when editing
  useEffect(() => {
    if (mode === 'edit' && group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        is_public: group.is_public
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        is_public: true
      });
    }
    setErrors({});
  }, [mode, group, isOpen]);

  const handleInputChange = (field: keyof CreateGroupData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
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
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      };
      
      if (mode === 'create') {
        result = await groupsService.createGroup(cleanedData);
      } else if (group) {
        const updates: UpdateGroupData = { ...cleanedData };
        result = await groupsService.updateGroup(group.id, updates);
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
      title={mode === 'create' ? 'Create New Group' : 'Edit Group'}
      size="md"
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
            <div className={styles.formGroupFull}>
              <Input
                label="Group Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="e.g., Book Club, Tool Library, etc."
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroupFull}>
              <Textarea
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the group's purpose"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroupFull}>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => handleInputChange('is_public', e.target.checked)}
                    disabled={loading}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    <strong>Public Group</strong>
                    <br />
                    <small>Anyone can discover and join this group</small>
                  </span>
                </label>
              </div>
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
            {mode === 'create' ? 'Create Group' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default GroupForm;
