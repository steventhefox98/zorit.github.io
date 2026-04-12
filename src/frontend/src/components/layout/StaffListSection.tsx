interface StaffMember {
  name: string;
  occupied: boolean;
}

interface StaffRole {
  title: string;
  members: StaffMember[];
  accentColor: string;
  borderColor: string;
  bgColor: string;
}

const staffRoles: StaffRole[] = [
  {
    title: "👑Owner👑",
    members: [
      { name: "Franc [Owner]", occupied: true },
      { name: "woofigames", occupied: true },
    ],
    accentColor: "oklch(0.78 0.22 80)",
    borderColor: "oklch(0.52 0.20 80)",
    bgColor: "oklch(0.15 0.07 80)",
  },
  {
    title: "🎩Co-Owner🎩",
    members: [
      { name: "Ardi", occupied: true },
      { name: "UNOCCUPIED", occupied: false },
    ],
    accentColor: "oklch(0.72 0.20 295)",
    borderColor: "oklch(0.48 0.18 295)",
    bgColor: "oklch(0.15 0.07 295)",
  },
  {
    title: "🎓Manager🎓",
    members: [{ name: "UNOCCUPIED", occupied: false }],
    accentColor: "oklch(0.68 0.18 220)",
    borderColor: "oklch(0.45 0.15 220)",
    bgColor: "oklch(0.14 0.06 220)",
  },
  {
    title: "🦋Advertise Manager🦋",
    members: [{ name: "UNOCCUPIED", occupied: false }],
    accentColor: "oklch(0.70 0.20 330)",
    borderColor: "oklch(0.48 0.17 330)",
    bgColor: "oklch(0.14 0.06 330)",
  },
  {
    title: "🐦‍🔥Chief Admin🐦‍🔥",
    members: [{ name: "UNOCCUPIED", occupied: false }],
    accentColor: "oklch(0.68 0.22 25)",
    borderColor: "oklch(0.46 0.18 25)",
    bgColor: "oklch(0.14 0.06 25)",
  },
  {
    title: "🪼 SR. Admin 🪼",
    members: [
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
    ],
    accentColor: "oklch(0.68 0.18 185)",
    borderColor: "oklch(0.46 0.15 185)",
    bgColor: "oklch(0.14 0.06 185)",
  },
  {
    title: "🐉 SR. Developer 🐉",
    members: [
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
    ],
    accentColor: "oklch(0.65 0.22 145)",
    borderColor: "oklch(0.44 0.18 145)",
    bgColor: "oklch(0.14 0.06 145)",
  },
  {
    title: "🐍 Developer 🐍",
    members: [
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
    ],
    accentColor: "oklch(0.62 0.20 145)",
    borderColor: "oklch(0.42 0.16 145)",
    bgColor: "oklch(0.13 0.05 145)",
  },
  {
    title: "🌺 Admin 🌺",
    members: [
      { name: "Gammy_601 | ☯Admin☯", occupied: true },
      { name: "woofigames", occupied: true },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
    ],
    accentColor: "oklch(0.70 0.20 350)",
    borderColor: "oklch(0.48 0.17 350)",
    bgColor: "oklch(0.14 0.06 350)",
  },
  {
    title: "🍄 JR. Admin 🍄",
    members: [
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
    ],
    accentColor: "oklch(0.65 0.18 40)",
    borderColor: "oklch(0.44 0.15 40)",
    bgColor: "oklch(0.14 0.05 40)",
  },
  {
    title: "🍂 Mod 🍂",
    members: [
      { name: "soumy9029", occupied: true },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
    ],
    accentColor: "oklch(0.65 0.18 55)",
    borderColor: "oklch(0.44 0.15 55)",
    bgColor: "oklch(0.14 0.05 55)",
  },
  {
    title: "🎋 Builder 🎋",
    members: [
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
    ],
    accentColor: "oklch(0.62 0.16 145)",
    borderColor: "oklch(0.42 0.13 145)",
    bgColor: "oklch(0.13 0.05 145)",
  },
];

export default function StaffListSection() {
  return (
    <section
      id="staff"
      className="py-24 relative overflow-hidden"
      style={{ background: "oklch(0.09 0.04 295)" }}
    >
      <div className="absolute inset-0 block-texture opacity-15" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
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
            TEAM
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
            Staff List
          </h2>
          <p
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: "1.2rem",
              color: "oklch(0.58 0.10 295)",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Meet the dedicated team keeping ZoritLegends running
          </p>
        </div>

        {/* Staff Panel */}
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
              ⚔ ZORITLEGENDS STAFF ROSTER ⚔
            </span>
          </div>

          {/* Roles list */}
          <div className="p-4 sm:p-6 space-y-0">
            {staffRoles.map((role, roleIndex) => (
              <div key={role.title}>
                {/* Role header */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    background: role.bgColor,
                    borderLeft: `4px solid ${role.accentColor}`,
                    borderTop: `1px solid ${role.borderColor}`,
                    borderRight: `1px solid ${role.borderColor}`,
                    borderBottom: `1px solid ${role.borderColor}`,
                  }}
                >
                  <span
                    className="font-pixel"
                    style={{
                      fontSize: "0.58rem",
                      color: role.accentColor,
                      letterSpacing: "0.08em",
                      textShadow: "1px 1px 0 oklch(0.07 0.03 295)",
                    }}
                  >
                    @{role.title}
                  </span>
                  <span
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: "0.85rem",
                      color: "oklch(0.45 0.08 295)",
                    }}
                  >
                    [{role.members.filter((m) => m.occupied).length}/
                    {role.members.length}]
                  </span>
                </div>

                {/* Members */}
                <div
                  style={{
                    background: "oklch(0.11 0.04 295)",
                    borderLeft: `4px solid ${role.borderColor}`,
                    borderRight: "1px solid oklch(0.20 0.08 295)",
                    borderBottom: "1px solid oklch(0.20 0.08 295)",
                  }}
                >
                  {role.members.map((member, memberIndex) => (
                    <div
                      key={`${member.name}-${memberIndex}`}
                      className="flex items-center gap-3 px-5 py-2"
                      style={{
                        borderBottom:
                          memberIndex < role.members.length - 1
                            ? "1px solid oklch(0.16 0.06 295)"
                            : "none",
                      }}
                    >
                      {member.occupied ? (
                        <>
                          <span
                            style={{
                              color: role.accentColor,
                              fontSize: "0.7rem",
                              lineHeight: 1,
                            }}
                          >
                            ●
                          </span>
                          <span
                            style={{
                              fontFamily: '"VT323", monospace',
                              fontSize: "1.1rem",
                              color: "oklch(0.88 0.06 295)",
                              letterSpacing: "0.02em",
                            }}
                          >
                            @{member.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <span
                            style={{
                              color: "oklch(0.32 0.06 295)",
                              fontSize: "0.7rem",
                              lineHeight: 1,
                            }}
                          >
                            ○
                          </span>
                          <span
                            style={{
                              fontFamily: '"VT323", monospace',
                              fontSize: "1.05rem",
                              color: "oklch(0.38 0.06 295)",
                              letterSpacing: "0.04em",
                              fontStyle: "italic",
                            }}
                          >
                            UNOCCUPIED
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider between roles (not after last) */}
                {roleIndex < staffRoles.length - 1 && (
                  <div
                    className="flex items-center gap-2 my-1 px-2"
                    style={{ opacity: 0.5 }}
                  >
                    <div
                      className="flex-1 h-px"
                      style={{ background: "oklch(0.25 0.08 295)" }}
                    />
                    <span
                      style={{
                        fontFamily: '"VT323", monospace',
                        fontSize: "0.75rem",
                        color: "oklch(0.30 0.08 295)",
                      }}
                    >
                      ——————
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "oklch(0.25 0.08 295)" }}
                    />
                  </div>
                )}
              </div>
            ))}
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
              ★ Interested in joining the team? Apply in our Discord server!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
