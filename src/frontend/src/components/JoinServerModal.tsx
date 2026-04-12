import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, Server } from "lucide-react";
import { useState } from "react";

const SERVER_IP = "mc.zoritlegends.com:60458";

interface JoinServerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function JoinServerModal({
  open,
  onClose,
}: JoinServerModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_IP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement("textarea");
      el.value = SERVER_IP;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-0 p-0 overflow-hidden bg-transparent shadow-none [&>button]:hidden">
        <div
          className="relative rounded-none border-4 overflow-hidden"
          style={{
            background: "oklch(0.14 0.06 295)",
            borderColor: "oklch(0.45 0.20 295)",
            boxShadow:
              "0 0 0 2px oklch(0.25 0.10 295), 0 0 40px oklch(0.62 0.22 295 / 0.4), 8px 8px 0 oklch(0.08 0.03 295)",
          }}
        >
          <div
            className="h-2 w-full"
            style={{
              background:
                "repeating-linear-gradient(90deg, oklch(0.62 0.22 295) 0px, oklch(0.62 0.22 295) 8px, oklch(0.45 0.18 295) 8px, oklch(0.45 0.18 295) 16px)",
            }}
          />

          <div className="p-8 pt-6">
            <DialogHeader className="mb-6">
              <div className="flex justify-center mb-4">
                <div
                  className="w-16 h-16 flex items-center justify-center rounded-none border-2 pulse-glow-anim"
                  style={{
                    background: "oklch(0.20 0.10 295)",
                    borderColor: "oklch(0.55 0.22 295)",
                  }}
                >
                  <Server size={32} style={{ color: "oklch(0.75 0.20 295)" }} />
                </div>
              </div>

              <DialogTitle
                className="text-center font-pixel text-sm leading-relaxed"
                style={{ color: "oklch(0.97 0.01 295)" }}
              >
                Join ZoritLegends
              </DialogTitle>
              <DialogDescription
                className="text-center mt-2"
                style={{
                  color: "oklch(0.65 0.08 295)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.875rem",
                }}
              >
                Copy the server IP and paste it in Minecraft
              </DialogDescription>
            </DialogHeader>

            <div className="mb-5 space-y-2">
              {[
                {
                  id: "step-1",
                  text: "Open Minecraft Java or Bedrock Edition",
                },
                { id: "step-2", text: "Go to Multiplayer → Add Server" },
                { id: "step-3", text: "Paste the IP below and connect!" },
              ].map((step, i) => (
                <div key={step.id} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-xs font-pixel rounded-none"
                    style={{
                      background: "oklch(0.45 0.20 295)",
                      color: "oklch(0.97 0.01 295)",
                      fontSize: "0.5rem",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      color: "oklch(0.75 0.08 295)",
                      fontSize: "0.8rem",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {step.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <p
                className="text-xs mb-2 font-pixel"
                style={{ color: "oklch(0.55 0.15 295)", fontSize: "0.5rem" }}
              >
                SERVER IP
              </p>
              <div
                className="ip-display w-full rounded-none"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.5rem",
                  letterSpacing: "0.05em",
                  color: "oklch(0.85 0.18 295)",
                  background: "oklch(0.08 0.04 295)",
                  border: "2px solid oklch(0.35 0.14 295)",
                  padding: "0.75rem 1rem",
                  textAlign: "center",
                  wordBreak: "break-all",
                }}
              >
                {SERVER_IP}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="minecraft-btn w-full py-3 px-6 flex items-center justify-center gap-3 transition-all duration-150 active:translate-y-0.5"
              style={{
                background: copied
                  ? "oklch(0.50 0.18 145)"
                  : "oklch(0.55 0.25 295)",
                color: "oklch(0.99 0 0)",
                border: "none",
                boxShadow: copied
                  ? "0 4px 0 oklch(0.30 0.12 145), inset 0 2px 0 oklch(0.65 0.20 145)"
                  : "0 4px 0 oklch(0.30 0.15 295), inset 0 2px 0 oklch(0.70 0.22 295)",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
              }}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  IP COPIED!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  COPY IP ADDRESS
                </>
              )}
            </button>

            {copied && (
              <p
                className="text-center mt-3 text-xs animate-fade-in"
                style={{
                  color: "oklch(0.65 0.18 145)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                ✓ Copied to clipboard! See you in-game!
              </p>
            )}
          </div>

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
