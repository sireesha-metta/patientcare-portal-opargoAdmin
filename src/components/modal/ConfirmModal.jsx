import { AlertTriangle } from "lucide-react";
import CustomModal from "./CustomModal";

const ConfirmModal = ({ open, onClose, onConfirm, title = "Confirm Action", message = "Are you sure you want to continue?",
  confirmText = "Confirm", cancelText = "Cancel", }) => {
  return (
    <CustomModal open={open} onClose={onClose} title={title} cancelText={cancelText} actionText={confirmText}
      onAction={onConfirm} maxWidth="sm"  >
      <div className="flex flex-col items-center py-2 text-center">
        <div className="mb-4 flex h-8 w-14 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </CustomModal>
  );
};

export default ConfirmModal;
