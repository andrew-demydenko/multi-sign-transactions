import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/stores/app-store";
import { modifyUser } from "@/services/user-service";

interface UserNameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditorModal = ({ isOpen, onClose }: UserNameModalProps) => {
  const userAddress = useAppStore((state) => state.userAddress);
  const userName = useAppStore((state) => state.userName);
  const setUserName = useAppStore((state) => state.setUserName);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutate: updateUser } = useMutation({
    mutationFn: (name: string) => {
      return modifyUser({ userAddress, name });
    },
    onSuccess: (result) => {
      if (result && result.name) {
        setUserName(result.name);
      }

      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!name.trim()) return;

    updateUser(name.trim());
  };

  useEffect(() => {
    if (userName) {
      setName(userName);
    }
  }, [isOpen, userName]);

  return (
    <div className={clsx("modal", { "modal-open": isOpen })}>
      <div className="modal-box max-w-xs">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          ✕
        </button>

        <h3 className="font-bold text-lg mb-4">User profile</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {submitted && !name?.trim() && (
              <label className="label">
                <span className="label-text-alt text-error">
                  Name is required
                </span>
              </label>
            )}
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditorModal;
