import { useToast } from "@/providers/toast-provider";

export const useCopyToClipboard = () => {
  const { showToast } = useToast();

  const copyToClipboard = ({
    text,
    toastMessage,
  }: {
    text: string;
    toastMessage: string;
  }) => {
    navigator.clipboard.writeText(text);
    showToast({ message: toastMessage, type: "success" });
  };

  return copyToClipboard;
};
