import React, { createContext, useContext, useState, useEffect } from "react";
import { Toast, ToastProps } from "@/components/Toast";
import { setToastHandler } from "@/lib/toast";

type ToastOptions = Omit<ToastProps, "onClose">;

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = (options: ToastOptions) => {
    setToast(options);
  };

  const handleClose = () => {
    setToast(null);
  };

  useEffect(() => {
    setToastHandler(showToast);
    return () => setToastHandler(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} onClose={handleClose} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
