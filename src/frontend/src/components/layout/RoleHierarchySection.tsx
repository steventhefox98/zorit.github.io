interface RoleEntry {
  emoji: string;
  name: string;
  maxPlayers: number;
  accentColor: string;
  borderColor: string;
  bgColor: string;
}

const roles: RoleEntry[] = [
  {
    emoji: "👑",
    name: "Owner",
    maxPlayers: 1,
    accentColor: "oklch(0.78 0.22 80)",
    borderColor: "oklch(0.52 0.20 80)",
    bgColor: "oklch(0.15 0.07 80)",
  },
  {
    emoji: "🎩",
    name: "Co-Owner",
    maxPlayers: 1,
    accentColor: "oklch(0.72 0.20 295)",
    borderColor: "oklch(0.48 0.18 295)",
    bgColor: "oklch(0.15 0.07 295)",
  },
  {
    emoji: "🎓",
    name: "Manager",
    maxPlayers: 1,
    accentColor: "oklch(0.68 0.18 220)",
    borderColor: "oklch(0.45 0.15 220)",
    bgColor: "oklch(0.14 0.06 220)",
  },
  {
    emoji: "🐦‍🔥",
    name: "Chief Admin",
    maxPlayers: 1,
    accentColor: "oklch(0.68 0.22 25)",
    borderColor: "oklch(0.46 0.18 25)",
    bgColor: "oklch(0.14 0.06 25)",
  },
  {
    emoji: "🪼",
    name: "SR. Admin",
    maxPlayers: 2,
    accentColor: "oklch(0.68 0.18 185)",
    borderColor: "oklch(0.46 0.15 185)",
    bgColor: "oklch(0.14 0.06 185)",
  },
  {
    emoji: "🐉",
    name: "SR. Developer",
    maxPlayers: 2,
    accentColor: "oklch(0.65 0.22 145)",
    borderColor: "oklch(0.44 0.18 145)",
    bgColor: "oklch(0.14 0.06 145)",
  },
  {
    emoji: "🐍",
    name: "Developer",
    maxPlayers: 4,
    accentColor: "oklch(0.62 0.20 145)",
    borderColor: "oklch(0.42 0.16 145)",
    bgColor: "oklch(0.13 0.05 145)",
  },
  {
    emoji: "🌺",
    name: "Admin",
    maxPlayers: 4,
    accentColor: "oklch(0.70 0.20 350)",
    borderColor: "oklch(0.48 0.17 350)",
    bgColor: "oklch(0.14 0.06 350)",
  },
  {
    emoji: "🪻",
    name: "Moderator",
    maxPlayers: 4,
    accentColor: "oklch(0.68 0.20 280)",
    borderColor: "oklch(0.46 0.17 280)",
    bgColor: "oklch(0.14 0.06 280)",
  },
  {
    emoji: "🍄",
    name: "JR. Admin",
    maxPlayers: 4,
    accentColor: "oklch(0.65 0.18 40)",
    borderColor: "oklch(0.44 0.15 40)",
    bgColor: "oklch(0.14 0.05 40)",
  },
  {
    emoji: "🍂",
    name: "Helper",
    maxPlayers: 5,
    accentColor: "oklch(0.65 0.18 55)",
    borderColor: "oklch(0.44 0.15 55)",
    bgColor: "oklch(0.14 0.05 55)",
  },
  {
    emoji: "🎋",
    name: "Builder",
    maxPlayers: 5,
    accentColor: "oklch(0.62 0.16 145)",
    borderColor: "oklch(0.42 0.13 145)",
    bgColor: "oklch(0.13 0.05 145)",
  },
];

export default function RoleHierarchySection() {
  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ background: "oklch(0.09 0.04 295)" }}
    >
      <div className="absolute inset-0 block-texture opacity-15" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div
            className="inline-block px-4 py-1 mb-4 font-pixel"
            style={{
              background: "oklch(0.18 0.10 295)",
              border: "2px solid oklch(0.38 0.18 295)",
              color: "oklch(0.68 0.20 295)",
              fontSize: "0.5rem",
              letterSpacing: "0.15em",
            }}
          >
            STRUCTURE
          </div>
          <h2
            className="font-pixel mb-4"
            style={{
              fontSize: "clamp(0.9rem, 2.5vw, 1.4rem)",
              color: "oklch(0.97 0.01 295)",
              lineHeight: "1.8",
              textShadow: "3px 3px 0 oklch(0.08 0.04 295)",
            }}
          >
            Staff Structure
          </h2>
        </div>

        {/* Role Hierarchy Panel */}
        <div
          className="relative"
          style={{
            background: "oklch(0.12 0.05 295)",
            border: "2px solid oklch(0.28 0.12 295)",
            boxShadow: "6px 6px 0 oklch(0.07 0.03 295)",
          }}
        >
          {/* Panel top bar */}
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{
              background: "oklch(0.18 0.10 295)",
              borderBottom: "2px solid oklch(0.28 0.12 295)",
            }}
          >
            <span
              className="font-pixel"
              style={{
                fontSize: "0.55rem",
                color: "oklch(0.75 0.20 295)",
                letterSpacing: "0.12em",
              }}
            >
              ⚔ ROLE HIERARCHY &amp; MAX PLAYERS ⚔
            </span>
          </div>

          {/* Roles list */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roles.map((role, index) => (
                <div
                  key={role.name}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                  style={{
                    background: role.bgColor,
                    borderLeft: `4px solid ${role.accentColor}`,
                    border: `1px solid ${role.borderColor}`,
                    borderLeftWidth: "4px",
                    borderLeftColor: role.accentColor,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Rank number badge */}
                    <span
                      className="font-pixel flex-shrink-0"
                      style={{
                        fontSize: "0.45rem",
                        color: "oklch(0.40 0.08 295)",
                        minWidth: "1.2rem",
                        textAlign: "right",
                      }}
                    >
                      #{index + 1}
                    </span>
                    <span
                      style={{
                        fontSize: "1.1rem",
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      {role.emoji}
                    </span>
                    <span
                      className="font-pixel truncate"
                      style={{
                        fontSize: "0.52rem",
                        color: role.accentColor,
                        letterSpacing: "0.06em",
                        textShadow: "1px 1px 0 oklch(0.07 0.03 295)",
                      }}
                    >
                      {role.name}
                    </span>
                  </div>

                  {/* Max Players badge */}
                  <div
                    className="flex-shrink-0 flex items-center gap-1 px-2 py-1"
                    style={{
                      background: "oklch(0.10 0.04 295)",
                      border: `1px solid ${role.borderColor}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"VT323", monospace',
                        fontSize: "0.75rem",
                        color: "oklch(0.50 0.08 295)",
                        lineHeight: 1,
                      }}
                    >
                      Max:
                    </span>
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: "0.55rem",
                        color: role.accentColor,
                        lineHeight: 1,
                      }}
                    >
                      {role.maxPlayers}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div
              className="mt-5 px-4 py-3 flex items-start gap-3"
              style={{
                background: "oklch(0.13 0.06 295)",
                border: "1px solid oklch(0.28 0.12 295)",
                borderLeft: "4px solid oklch(0.55 0.18 295)",
              }}
            >
              <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>
                ⚠️
              </span>
              <p
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "1.1rem",
                  color: "oklch(0.62 0.12 295)",
                  lineHeight: 1.5,
                }}
              >
                Some staff may have more players due to some reasons.
              </p>
            </div>
          </div>

          {/* Panel footer */}
          <div
            className="px-4 py-3 text-center"
            style={{
              borderTop: "2px solid oklch(0.22 0.08 295)",
              background: "oklch(0.11 0.05 295)",
            }}
          >
            <p
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1rem",
                color: "oklch(0.45 0.10 295)",
              }}
            >
              ★ Roles are listed from highest to lowest rank ★
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
