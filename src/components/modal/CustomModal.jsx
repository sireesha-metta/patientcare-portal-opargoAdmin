import Modal from "patientcare-portal-sharedui/Modal";

const CustomModal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  cancelText = "Cancel",
  actionText = "Add",
  onAction,
  onCancel,
  maxWidth = "sm",
  showCancel = true,
  actionDisabled = false,
  actionLoading = false,
  footer,
  className = "",
  headerBg,
  headerClassName,
  cancelVariant,
  actionVariant,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      cancelText={cancelText}
      actionText={actionText}
      onAction={onAction}
      onCancel={onCancel}
      maxWidth={maxWidth}
      showCancel={showCancel}
      actionDisabled={actionDisabled}
      actionLoading={actionLoading}
      footer={footer}
      className={className}
      headerBg={headerBg}
      headerClassName={headerClassName}
      cancelVariant={cancelVariant}
      actionVariant={actionVariant}
    >
      {children}
    </Modal>
  );
};

export default CustomModal;
