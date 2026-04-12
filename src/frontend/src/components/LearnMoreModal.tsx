import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen } from "lucide-react";

interface LearnMoreModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LearnMoreModal({ open, onClose }: LearnMoreModalProps) {
  const features = [
    { icon: "⚔️", text: "Competitive and fair gameplay" },
    { icon: "📚", text: "Learning-friendly environment for beginners" },
    { icon: "🏆", text: "Exciting events, challenges, and rewards" },
    { icon: "🤝", text: "Supportive and active community" },
    { icon: "🛡️", text: "Dedicated staff ensuring a safe experience" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg border-0 p-0 overflow-hidden bg-transparent shadow-none [&>button]:hidden">
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
                  <BookOpen
                    size={32}
                    style={{ color: "oklch(0.75 0.20 295)" }}
                  />
                </div>
              </div>

              <DialogTitle
                className="text-center font-pixel leading-relaxed"
                style={{ color: "oklch(0.97 0.01 295)", fontSize: "0.65rem" }}
              >
                🌟 Welcome to Zoritlegends 🌟
              </DialogTitle>
              <DialogDescription
                className="text-center mt-2"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.1rem",
                  color: "oklch(0.72 0.18 295)",
                  letterSpacing: "0.03em",
                }}
              >
                Where Legends Are Born and Skills Are Forged
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-72 pr-2">
              <div className="space-y-4">
                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1.05rem",
                    color: "oklch(0.72 0.08 295)",
                    lineHeight: "1.6",
                  }}
                >
                  Zoritlegends is more than just a server — it's a thriving
                  community built for players who want to grow, compete, and
                  connect. Whether you're a beginner looking to learn the ropes
                  or a seasoned player ready to dominate, Zoritlegends gives you
                  the perfect environment to level up your skills.
                </p>

                <div>
                  <p
                    className="font-pixel mb-3"
                    style={{
                      fontSize: "0.5rem",
                      color: "oklch(0.80 0.20 295)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    🔥 What Makes Zoritlegends Special?
                  </p>
                  <div className="space-y-2">
                    {features.map(({ icon, text }) => (
                      <div key={text} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-none border"
                          style={{
                            background: "oklch(0.20 0.10 295)",
                            borderColor: "oklch(0.40 0.18 295)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {icon}
                        </span>
                        <span
                          style={{
                            fontFamily: '"VT323", monospace',
                            fontSize: "1.05rem",
                            color: "oklch(0.75 0.08 295)",
                            lineHeight: "1.5",
                          }}
                        >
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1.05rem",
                    color: "oklch(0.72 0.08 295)",
                    lineHeight: "1.6",
                  }}
                >
                  At Zoritlegends, every player has the chance to become a
                  legend. We focus on improvement, teamwork, and creating
                  unforgettable moments.
                </p>

                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1.05rem",
                    color: "oklch(0.72 0.08 295)",
                    lineHeight: "1.6",
                  }}
                >
                  Join today, sharpen your abilities, and start your journey
                  toward greatness.
                </p>

                <div
                  className="rounded-none border-2 p-3 text-center"
                  style={{
                    background: "oklch(0.18 0.09 295)",
                    borderColor: "oklch(0.45 0.20 295)",
                  }}
                >
                  <p
                    className="font-pixel"
                    style={{
                      fontSize: "0.5rem",
                      color: "oklch(0.85 0.20 295)",
                      letterSpacing: "0.08em",
                      lineHeight: "1.8",
                    }}
                  >
                    Zoritlegends — Learn. Compete. Become Legendary.
                  </p>
                </div>
              </div>
            </ScrollArea>

            <button
              type="button"
              onClick={onClose}
              className="minecraft-btn w-full py-3 px-6 flex items-center justify-center gap-3 mt-5 transition-all duration-150 active:translate-y-0.5"
              style={{
                background: "oklch(0.55 0.25 295)",
                color: "oklch(0.99 0 0)",
                boxShadow:
                  "0 4px 0 oklch(0.28 0.14 295), inset 0 2px 0 oklch(0.72 0.22 295)",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
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
              ✦ CLOSE
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
