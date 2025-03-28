import { XMarkIcon } from "@heroicons/react/20/solid";
import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const buttonVariants = cva("btn", {
  variants: {
    variant: {
      default: "btn-primary",
      destructive: "btn-error text-white",
      warning: "btn-warning",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ConfirmationModalProps extends VariantProps<typeof buttonVariants> {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  icon?: ReactNode;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  icon,
  isProcessing = false,
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={clsx("modal", { "modal-open": isOpen })}>
      <div className="modal-box max-w-md">
        <button
          onClick={onCancel}
          className="btn btn-sm btn-circle absolute right-2 top-2"
          disabled={isProcessing}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>

        <h3 className="font-bold text-lg">{title}</h3>

        <div className="alert alert-info bg-white border-0 mt-4">
          {icon}
          <span>{description}</span>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onCancel} disabled={isProcessing}>
            {cancelText}
          </button>
          <button
            className={clsx(buttonVariants({ variant }))}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="loading loading-spinner"></span>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
