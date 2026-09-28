import CustomModal from "./CustomModal";

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
}) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={title}
      cancelText={cancelText}
      actionText={loading ? "Deleting..." : confirmText}
      onAction={onConfirm}
      actionLoading={loading}
      maxWidth="sm"
      headerBg="blue"
      cancelVariant="blue"
      actionVariant="danger"
    >
      <div className="py-2">
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          {message}
        </p>
      </div>
    </CustomModal>
  );
};

export default ConfirmModal;
