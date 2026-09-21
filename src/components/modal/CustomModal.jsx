import { useEffect } from "react";
import { X } from "lucide-react";

const CustomModal = ({open,onClose,title,children,cancelText = "Cancel",actionText = "Add", onAction, maxWidth = "sm", showCancel = true,}) => {

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidthClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  };

  const selectedWidth = maxWidthClasses[maxWidth] || "max-w-sm";

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/60" onClick={onClose} />
      <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className={`pointer-events-auto relative flex max-h-[90vh] w-full ${selectedWidth} flex-col rounded-xl border border-gray-200 bg-white shadow-2xl`} onClick={(e) => e.stopPropagation()} >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close" >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
          {actionText || showCancel ? (
            <div className="flex justify-end gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50 px-6 py-4">
              {actionText ? (
                <button type="button" onClick={onAction}  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"   >
                  {actionText}
                </button>
              ) : null}
              {showCancel ? (
                <button type="button"  onClick={onClose}   className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" >
                  {cancelText}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default CustomModal;
