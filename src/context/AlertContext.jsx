import { createContext, useContext, useState, useCallback, useRef } from "react";
import AlertModal from "../components/AlertModal";

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const resolveRef = useRef(null);
  const [state, setState] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    confirmLabel: "OK",
    cancelLabel: "Cancel",
    showCancel: false,
  });

  const showAlert = useCallback((message, type = "info", title = "") => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({
        isOpen: true,
        type,
        title,
        message,
        confirmLabel: "OK",
        cancelLabel: "Cancel",
        showCancel: false,
      });
    });
  }, []);

  const showConfirm = useCallback(
    (message, options = {}) => {
      const {
        title = "Confirm",
        confirmLabel = "Yes, proceed",
        cancelLabel = "Cancel",
        type = "warning",
      } = options;

      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setState({
          isOpen: true,
          type,
          title,
          message,
          confirmLabel,
          cancelLabel,
          showCancel: true,
        });
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertModal
        isOpen={state.isOpen}
        onClose={handleClose}
        type={state.type}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        showCancel={state.showCancel}
        onConfirm={handleConfirm}
        onCancel={handleClose}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within AlertProvider");
  return ctx;
}
