import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground-950/50 p-4 sm:items-center">
      <div
        className={`relative my-4 w-full ${
          size === "lg" ? "max-w-3xl" : "max-w-xl"
        } rounded-[2rem] border border-background-200 bg-background-50 shadow-soft`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-background-200/70 px-6 py-4">
          <h2 className="font-heading text-lg font-semibold text-foreground-950">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-500 transition-colors hover:bg-background-100"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-background-200/70 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}