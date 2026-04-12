import { SiDiscord } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "oklch(0.07 0.03 295)" }}
    >
      <div
        className="h-2 w-full"
        style={{
          background:
            "repeating-linear-gradient(90deg, oklch(0.45 0.20 295) 0px, oklch(0.45 0.20 295) 8px, oklch(0.30 0.14 295) 8px, oklch(0.30 0.14 295) 16px, oklch(0.55 0.22 295) 16px, oklch(0.55 0.22 295) 24px, oklch(0.30 0.14 295) 24px, oklch(0.30 0.14 295) 32px)",
        }}
      />

      <div className="absolute inset-0 block-texture opacity-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <img
              src="/assets/generated/zoritlegends-logo.dim_512x128.png"
              alt="ZoritLegends"
              className="h-10 w-auto object-contain mb-4"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "block";
              }}
            />
            <p
              className="font-pixel mb-1"
              style={{
                display: "none",
                fontSize: "0.7rem",
                color: "oklch(0.80 0.18 295)",
              }}
            >
              ZoritLegends
            </p>
            <p
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.1rem",
                color: "oklch(0.50 0.08 295)",
                lineHeight: "1.6",
                maxWidth: "300px",
              }}
            >
              The ultimate Minecraft server experience. Battle, survive, and
              forge your legend.
            </p>

            <div className="flex gap-3 mt-5">
              <a
                href="https://discord.gg/UGCjrpj7Jg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="w-9 h-9 flex items-center justify-center transition-all duration-150 hover:opacity-80"
                style={{
                  background: "oklch(0.14 0.06 295)",
                  border: "2px solid oklch(0.25 0.10 295)",
                  color: "oklch(0.60 0.18 270)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "oklch(0.45 0.20 295)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "oklch(0.25 0.10 295)";
                }}
              >
                <SiDiscord size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4
              className="font-pixel mb-4"
              style={{
                fontSize: "0.55rem",
                color: "oklch(0.70 0.18 295)",
                letterSpacing: "0.1em",
              }}
            >
              QUICK LINKS
            </h4>
            <ul className="space-y-2">
              {["Home", "Features"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "1.05rem",
                      color: "oklch(0.50 0.08 295)",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "oklch(0.75 0.15 295)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "oklch(0.50 0.08 295)";
                    }}
                  >
                    <span style={{ color: "oklch(0.45 0.18 295)" }}>▸</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              className="font-pixel mb-4"
              style={{
                fontSize: "0.55rem",
                color: "oklch(0.70 0.18 295)",
                letterSpacing: "0.1em",
              }}
            >
              SERVER INFO
            </h4>
            <div className="space-y-3">
              <div>
                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "0.85rem",
                    color: "oklch(0.45 0.10 295)",
                    letterSpacing: "0.05em",
                  }}
                >
                  SERVER IP
                </p>
                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1rem",
                    color: "oklch(0.70 0.18 295)",
                    letterSpacing: "0.03em",
                  }}
                >
                  mc.zoritlegends.com:60458
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "0.85rem",
                    color: "oklch(0.45 0.10 295)",
                    letterSpacing: "0.05em",
                  }}
                >
                  VERSION
                </p>
                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1rem",
                    color: "oklch(0.60 0.10 295)",
                  }}
                >
                  Java & Bedrock
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "0.85rem",
                    color: "oklch(0.45 0.10 295)",
                    letterSpacing: "0.05em",
                  }}
                >
                  STATUS
                </p>
                <p
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: "1rem",
                    color: "oklch(0.65 0.22 145)",
                  }}
                >
                  ● ONLINE
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex items-center justify-center"
          style={{ borderTop: "1px solid oklch(0.18 0.07 295)" }}
        >
          <p
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "0.95rem",
              color: "oklch(0.38 0.07 295)",
            }}
          >
            © {year} ZoritLegends. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
