import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOut, X } from "lucide-react";

interface LogoutConfirmModalProps {
  open: boolean;
  username: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmModal({
  open,
  username,
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm border-0 p-0 overflow-hidden bg-transparent shadow-none">
        <div
          className="relative rounded-none border-4 overflow-hidden"
          style={{
            background: "oklch(0.14 0.06 295)",
            borderColor: "oklch(0.45 0.20 295)",
            boxShadow:
              "0 0 0 2px oklch(0.25 0.10 295), 0 0 40px oklch(0.62 0.22 295 / 0.4), 8px 8px 0 oklch(0.08 0.03 295)",
          }}
        >
          {/* Top pixel stripe */}
          <div
            className="h-2 w-full"
            style={{
              background:
                "repeating-linear-gradient(90deg, oklch(0.62 0.22 295) 0px, oklch(0.62 0.22 295) 8px, oklch(0.45 0.18 295) 8px, oklch(0.45 0.18 295) 16px)",
            }}
          />

          <button
            type="button"
            data-ocid="logout.confirm.close_button"
            onClick={onCancel}
            className="absolute top-4 right-4 z-10 p-1 transition-colors hover:opacity-70"
            style={{ color: "oklch(0.65 0.08 295)" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="p-7 pt-5">
            <DialogHeader className="mb-5">
              <div className="flex justify-center mb-3">
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-none border-2 pulse-glow-anim"
                  style={{
                    background: "oklch(0.20 0.10 295)",
                    borderColor: "oklch(0.55 0.22 295)",
                  }}
                >
                  <LogOut size={28} style={{ color: "oklch(0.75 0.20 295)" }} />
                </div>
              </div>
              <DialogTitle
                className="text-center font-pixel leading-relaxed"
                style={{ color: "oklch(0.97 0.01 295)", fontSize: "0.6rem" }}
              >
                LOG OUT?
              </DialogTitle>
              <DialogDescription
                className="text-center mt-2"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.05rem",
                  color: "oklch(0.65 0.10 295)",
                  lineHeight: 1.3,
                }}
              >
                {username ? (
                  <>
                    You are about to log out as{" "}
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: "0.5rem",
                        color: "oklch(0.80 0.18 295)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {username}
                    </span>
                    . Are you sure?
                  </>
                ) : (
                  "Are you sure you want to log out?"
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                data-ocid="logout.confirm.cancel_button"
                onClick={onCancel}
                className="minecraft-btn flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all duration-150 active:translate-y-0.5"
                style={{
                  background: "oklch(0.18 0.08 295)",
                  color: "oklch(0.80 0.15 295)",
                  border: "2px solid oklch(0.40 0.18 295)",
                  boxShadow: "0 3px 0 oklch(0.10 0.05 295)",
                  fontSize: "0.5rem",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "oklch(0.24 0.10 295)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "oklch(0.18 0.08 295)";
                }}
              >
                STAY
              </button>
              <button
                type="button"
                data-ocid="logout.confirm.confirm_button"
                onClick={onConfirm}
                className="minecraft-btn flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all duration-150 active:translate-y-0.5"
                style={{
                  background: "oklch(0.55 0.25 295)",
                  color: "oklch(0.99 0 0)",
                  border: "none",
                  boxShadow:
                    "0 4px 0 oklch(0.30 0.15 295), inset 0 2px 0 oklch(0.70 0.22 295)",
                  fontSize: "0.5rem",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "oklch(0.62 0.25 295)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "oklch(0.55 0.25 295)";
                }}
              >
                <LogOut size={12} />
                LOG OUT
              </button>
            </div>
          </div>

          {/* Bottom pixel stripe */}
          <div
            className="h-2 w-full"
            style={{
              background:
                "repeating-linear-gradient(90deg, oklch(0.45 0.18 295) 0px, oklch(0.45 0.18 295) 8px, oklch(0.30 0.12 295) 8px, oklch(0.30 0.12 295) 16px)",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
