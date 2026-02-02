import { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: {
    icon: "bg-emerald-500/20 text-emerald-500 dark:text-emerald-400",
    button: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500",
  },
  error: {
    icon: "bg-red-500/20 text-red-500 dark:text-red-400",
    button: "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500",
  },
  warning: {
    icon: "bg-amber-500/20 text-amber-500 dark:text-amber-400",
    button: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500",
  },
  info: {
    icon: "bg-indigo-500/20 text-indigo-500 dark:text-indigo-400",
    button: "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500",
  },
};

export default function AlertModal({
  isOpen,
  onClose,
  type = "info",
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  showCancel = false,
}) {
  const IconComponent = ICONS[type] || Info;
  const style = STYLES[type] || STYLES.info;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showCancel) onCancel?.();
        else onClose?.();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, showCancel, onCancel, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm?.();
    if (!showCancel) onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => e.target === e.currentTarget && handleCancel()}
    >
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform animate-[zoomIn_0.2s_ease-out]">
        <div className="p-6 sm:p-8">
          {/* Close button */}
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div
            className={`inline-flex p-3 rounded-2xl mb-4 ${style.icon}`}
          >
            <IconComponent className="w-8 h-8" strokeWidth={2} />
          </div>

          {/* Title */}
          {title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            {showCancel && (
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${style.button}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
