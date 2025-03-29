import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { cva, type VariantProps } from "class-variance-authority";

const getInitialTransform = (position?: string | null) => {
  switch (position) {
    case "top-left":
    case "top-right":
    case "top-center":
      return "translateY(-20px)";
    case "bottom-left":
    case "bottom-right":
    case "bottom-center":
      return "translateY(20px)";
    default:
      return "translateY(20px)";
  }
};

const toastVariants = cva(
  "fixed z-1001 rounded-md shadow-lg p-4 flex items-center transition-all duration-300",
  {
    variants: {
      position: {
        "top-left": "top-4 left-4",
        "top-right": "top-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "top-center": "top-4 left-1/2 -translate-x-1/2",
        "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
      },
      type: {
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-white",
        info: "bg-blue-500 text-white",
      },
      animation: {
        slide: "animate-toast-slide",
        fade: "animate-toast-fade",
        pop: "animate-toast-pop",
      },
    },
    defaultVariants: {
      position: "bottom-right",
      type: "info",
      animation: "slide",
    },
  }
);

type ToastProps = VariantProps<typeof toastVariants> & {
  message: string;
  duration?: number;
  onClose: () => void;
};

export const Toast = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
  position = "bottom-right",
  animation = "slide",
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon = {
    success: <CheckCircleIcon className="size-5" />,
    error: <ExclamationCircleIcon className="size-5" />,
    warning: <ExclamationCircleIcon className="size-5" />,
    info: null,
  }[type || "info"];

  return (
    <div
      className={toastVariants({ position, type, animation })}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : getInitialTransform(position),
      }}
    >
      {icon && <div className="mr-2">{icon}</div>}
      <span className="mr-4">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-auto btn btn-ghost size-5 p-0"
      >
        <XMarkIcon className="size-4" />
      </button>
    </div>
  );
};
