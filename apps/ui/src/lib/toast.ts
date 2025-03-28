import { ToastOptions } from "@/components/Toast";

let toastHandler: ((options: ToastOptions) => void) | null = null;

export const setToastHandler = (handler: (options: ToastOptions) => void) => {
  toastHandler = handler;
};

export const showGlobalToast = (options: ToastOptions) => {
  if (toastHandler) {
    toastHandler(options);
  } else {
    console.warn("Toast handler not initialized");
  }
};
