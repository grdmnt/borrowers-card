import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, ModalBody, ModalFooter, Loading } from '@/components/UI';
import { Group, groupsService } from '@/services/groups';
import styles from '@/styles/components/ItemForm.module.css';

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
}

const InviteLinkModal: React.FC<InviteLinkModalProps> = ({
  isOpen,
  onClose,
  group
}) => {
  const [inviteLink, setInviteLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate invite link when modal opens
  useEffect(() => {
    if (isOpen) {
      generateLink();
    }
  }, [isOpen]);

  const generateLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await groupsService.generateInviteLink(group.id);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setInviteLink(result.data);
      }
    } catch (error) {
      console.error('Error generating invite link:', error);
      setError('Failed to generate invite link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  const handleClose = () => {
    setInviteLink('');
    setCopied(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Invite Members to ${group.name}`}
      size="md"
    >
      <ModalBody>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loading size="md" variant="spinner" text="Generating invite link..." />
          </div>
        ) : (
          <>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {inviteLink && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Invite Link:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Input
                      value={inviteLink}
                      readOnly
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      style={{ flex: 1 }}
                    />
                    <Button
                      variant={copied ? 'primary' : 'outline'}
                      size="sm"
                      onClick={copyToClipboard}
                      style={{ minWidth: '80px' }}
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>


                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                    📋 How it works:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.4' }}>
                    <li><strong>Share the link</strong> with anyone you want to invite</li>
                    <li><strong>New users</strong> will be prompted to sign up first</li>
                    <li><strong>Existing users</strong> will join the group immediately</li>
                    <li><strong>Link works</strong> for anyone who has it</li>
                  </ul>
                </div>
              </>
            )}
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          Done
        </Button>
        {inviteLink && !loading && (
          <Button variant="primary" onClick={copyToClipboard}>
            {copied ? '✓ Link Copied' : 'Copy Link'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default InviteLinkModal;
