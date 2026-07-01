import { Role, type RosterGroup, RosterRank } from "@/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useRankSlots, useRoster, useSetRankSlot } from "@/hooks/useQueries";

/* ------------------------------------------------------------------ */
/*  Canonical rank hierarchy — single source of truth for this panel.  */
/*  Order matches backend RosterRank display order. #Cop and #SrCop    */
/*  sit adjacent to #Mod; #Builder is last.                            */
/* ------------------------------------------------------------------ */

export interface RankMeta {
  rank: RosterRank;
  emoji: string;
  label: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  defaultSlots: number;
}

export const RANKS: RankMeta[] = [
  {
    rank: RosterRank.Owner,
    emoji: "👑",
    label: "Owner",
    accentColor: "oklch(0.78 0.22 80)",
    borderColor: "oklch(0.52 0.20 80)",
    bgColor: "oklch(0.15 0.07 80)",
    defaultSlots: 2,
  },
  {
    rank: RosterRank.CoOwner,
    emoji: "🎩",
    label: "Co-Owner",
    accentColor: "oklch(0.72 0.20 295)",
    borderColor: "oklch(0.48 0.18 295)",
    bgColor: "oklch(0.15 0.07 295)",
    defaultSlots: 2,
  },
  {
    rank: RosterRank.Manager,
    emoji: "🎓",
    label: "Manager",
    accentColor: "oklch(0.68 0.18 220)",
    borderColor: "oklch(0.45 0.15 220)",
    bgColor: "oklch(0.14 0.06 220)",
    defaultSlots: 1,
  },
  {
    rank: RosterRank.AdvertiseManager,
    emoji: "🦋",
    label: "Advertise Manager",
    accentColor: "oklch(0.70 0.20 330)",
    borderColor: "oklch(0.48 0.17 330)",
    bgColor: "oklch(0.14 0.06 330)",
    defaultSlots: 1,
  },
  {
    rank: RosterRank.ChiefAdmin,
    emoji: "🐦‍🔥",
    label: "Chief Admin",
    accentColor: "oklch(0.68 0.22 25)",
    borderColor: "oklch(0.46 0.18 25)",
    bgColor: "oklch(0.14 0.06 25)",
    defaultSlots: 1,
  },
  {
    rank: RosterRank.SrDeveloper,
    emoji: "🐉",
    label: "SR. Developer",
    accentColor: "oklch(0.65 0.22 145)",
    borderColor: "oklch(0.44 0.18 145)",
    bgColor: "oklch(0.14 0.06 145)",
    defaultSlots: 2,
  },
  {
    rank: RosterRank.Developer,
    emoji: "🐍",
    label: "Developer",
    accentColor: "oklch(0.62 0.20 145)",
    borderColor: "oklch(0.42 0.16 145)",
    bgColor: "oklch(0.13 0.05 145)",
    defaultSlots: 4,
  },
  {
    rank: RosterRank.Admin,
    emoji: "🌺",
    label: "Admin",
    accentColor: "oklch(0.70 0.20 350)",
    borderColor: "oklch(0.48 0.17 350)",
    bgColor: "oklch(0.14 0.06 350)",
    defaultSlots: 4,
  },
  {
    rank: RosterRank.JrAdmin,
    emoji: "🍄",
    label: "JR. Admin",
    accentColor: "oklch(0.65 0.18 40)",
    borderColor: "oklch(0.44 0.15 40)",
    bgColor: "oklch(0.14 0.05 40)",
    defaultSlots: 4,
  },
  {
    rank: RosterRank.Mod,
    emoji: "🍂",
    label: "Mod",
    accentColor: "oklch(0.65 0.18 55)",
    borderColor: "oklch(0.44 0.15 55)",
    bgColor: "oklch(0.14 0.05 55)",
    defaultSlots: 5,
  },
  {
    rank: RosterRank.Cop,
    emoji: "🚔",
    label: "Cop",
    accentColor: "oklch(0.66 0.16 220)",
    borderColor: "oklch(0.44 0.13 220)",
    bgColor: "oklch(0.14 0.06 220)",
    defaultSlots: 3,
  },
  {
    rank: RosterRank.SrCop,
    emoji: "🚓",
    label: "Sr-Cop",
    accentColor: "oklch(0.66 0.18 200)",
    borderColor: "oklch(0.44 0.15 200)",
    bgColor: "oklch(0.14 0.06 200)",
    defaultSlots: 3,
  },
  {
    rank: RosterRank.Builder,
    emoji: "🎋",
    label: "Builder",
    accentColor: "oklch(0.62 0.16 145)",
    borderColor: "oklch(0.42 0.13 145)",
    bgColor: "oklch(0.13 0.05 145)",
    defaultSlots: 5,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Build a rank -> slots map from backend RankSlot[], falling back to defaults. */
function buildSlotsMap(
  rankSlots: { rank: RosterRank; slots: bigint }[] | undefined,
): Map<RosterRank, number> {
  const map = new Map<RosterRank, number>();
  if (rankSlots && rankSlots.length > 0) {
    for (const s of rankSlots) {
      map.set(s.rank, Number(s.slots));
    }
  }
  // Fill any missing ranks with defaults so the UI always has a value.
  for (const r of RANKS) {
    if (!map.has(r.rank)) map.set(r.rank, r.defaultSlots);
  }
  return map;
}

/** Build a rank -> occupied member count map from the backend roster. */
function buildMemberCountMap(
  roster: RosterGroup[] | undefined,
): Map<RosterRank, number> {
  const map = new Map<RosterRank, number>();
  if (roster) {
    for (const group of roster) {
      map.set(group.rank, group.members.length);
    }
  }
  return map;
}

/* ------------------------------------------------------------------ */
/*  Per-rank slot stepper — Administrator-only (strict === check).     */
/*  Replaces the old single AddSlotsControl + admin/coadmin stepper.   */
/*  Decrement is disabled when occupied > current to protect members.  */
/* ------------------------------------------------------------------ */

interface SlotStepperProps {
  rank: RosterRank;
  label: string;
  slots: number;
  memberCount: number;
  accentColor: string;
  borderColor: string;
  disabled: boolean;
  onDecrement: (rank: RosterRank) => void;
  onIncrement: (rank: RosterRank) => void;
}

function SlotStepper({
  rank,
  label,
  slots,
  memberCount,
  accentColor,
  borderColor,
  disabled,
  onDecrement,
  onIncrement,
}: SlotStepperProps) {
  // Decrement guard: never below 0, and never below occupied count
  // (so an admin cannot shrink a rank past its currently-filled positions).
  const atFloor = slots <= 0 || memberCount >= slots;
  const canDecrement = !disabled && !atFloor;
  const canIncrement = !disabled;

  const btnBase: React.CSSProperties = {
    fontFamily: '"Press Start 2P", monospace',
    fontSize: "0.6rem",
    lineHeight: 1,
    width: "1.6rem",
    height: "1.6rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "background 0.15s, color 0.15s",
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Member count chip */}
      <span
        style={{
          fontFamily: '"VT323", monospace',
          fontSize: "0.85rem",
          color: "oklch(0.50 0.08 295)",
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
        aria-label={`${label} current members`}
      >
        {memberCount}/
      </span>

      {/* Decrement */}
      <button
        type="button"
        data-ocid={`role_hierarchy.slot_decrement.${rank}`}
        aria-label={`Decrease ${label} slot count`}
        title={
          atFloor
            ? memberCount >= slots
              ? `Cannot shrink below ${memberCount} occupied slot${memberCount === 1 ? "" : "s"}`
              : "Already at zero slots"
            : `Decrease ${label} slots`
        }
        onClick={() => canDecrement && onDecrement(rank)}
        disabled={!canDecrement}
        style={{
          ...btnBase,
          color: canDecrement ? "oklch(0.85 0.16 25)" : "oklch(0.45 0.08 295)",
          background: canDecrement
            ? "oklch(0.18 0.08 25)"
            : "oklch(0.12 0.05 295)",
          borderColor: canDecrement
            ? "oklch(0.50 0.18 25)"
            : "oklch(0.30 0.10 295)",
        }}
        onMouseEnter={(e) => {
          if (canDecrement) {
            (e.currentTarget as HTMLElement).style.background =
              "oklch(0.30 0.14 25)";
            (e.currentTarget as HTMLElement).style.color = "oklch(0.99 0 0)";
          }
        }}
        onMouseLeave={(e) => {
          if (canDecrement) {
            (e.currentTarget as HTMLElement).style.background =
              "oklch(0.18 0.08 25)";
            (e.currentTarget as HTMLElement).style.color =
              "oklch(0.85 0.16 25)";
          }
        }}
      >
        −
      </button>

      {/* Slot count display */}
      <span
        data-ocid={`role_hierarchy.slot_value.${rank}`}
        className="font-pixel"
        style={{
          fontSize: "0.6rem",
          color: accentColor,
          lineHeight: 1,
          minWidth: "1.4rem",
          textAlign: "center",
          padding: "0.2rem 0.3rem",
          background: "oklch(0.10 0.04 295)",
          border: `1px solid ${borderColor}`,
        }}
        aria-label={`${label} max slots: ${slots}`}
      >
        {slots}
      </span>

      {/* Increment */}
      <button
        type="button"
        data-ocid={`role_hierarchy.slot_increment.${rank}`}
        aria-label={`Increase ${label} slot count`}
        title={`Increase ${label} slots`}
        onClick={() => canIncrement && onIncrement(rank)}
        disabled={!canIncrement}
        style={{
          ...btnBase,
          color: canIncrement ? "oklch(0.85 0.18 145)" : "oklch(0.45 0.08 295)",
          background: canIncrement
            ? "oklch(0.18 0.08 145)"
            : "oklch(0.12 0.05 295)",
          borderColor: canIncrement
            ? "oklch(0.50 0.18 145)"
            : "oklch(0.30 0.10 295)",
        }}
        onMouseEnter={(e) => {
          if (canIncrement) {
            (e.currentTarget as HTMLElement).style.background =
              "oklch(0.30 0.14 145)";
            (e.currentTarget as HTMLElement).style.color = "oklch(0.99 0 0)";
          }
        }}
        onMouseLeave={(e) => {
          if (canIncrement) {
            (e.currentTarget as HTMLElement).style.background =
              "oklch(0.18 0.08 145)";
            (e.currentTarget as HTMLElement).style.color =
              "oklch(0.85 0.18 145)";
          }
        }}
      >
        +
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section                                                       */
/* ------------------------------------------------------------------ */

export default function RoleHierarchySection() {
  const { username, role } = useAuth();
  // Administrator-only (strict === check). CoAdministrator is intentionally
  // excluded from slot editing per requirement.
  const isAdministrator = role === Role.Administrator;

  const slotsQuery = useRankSlots();
  const rosterQuery = useRoster();
  const setSlotMutation = useSetRankSlot();

  const slotsMap = buildSlotsMap(slotsQuery.data);
  const memberCountMap = buildMemberCountMap(rosterQuery.data);

  const handleDecrement = (rank: RosterRank) => {
    if (!username) return;
    const current = slotsMap.get(rank) ?? 0;
    if (current <= 0) return;
    setSlotMutation.mutate({
      callerUsername: username,
      rank,
      slots: BigInt(Math.max(0, current - 1)),
    });
  };

  const handleIncrement = (rank: RosterRank) => {
    if (!username) return;
    const current = slotsMap.get(rank) ?? 0;
    setSlotMutation.mutate({
      callerUsername: username,
      rank,
      slots: BigInt(current + 1),
    });
  };

  const mutatingRank = setSlotMutation.variables?.rank ?? null;

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
          {isAdministrator && (
            <p
              data-ocid="role_hierarchy.admin_mode.banner"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1rem",
                color: "oklch(0.72 0.20 145)",
                marginTop: "0.25rem",
                letterSpacing: "0.04em",
              }}
            >
              ⚒ Admin mode — adjust each rank's slots with + / −
            </p>
          )}
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
              ⚔ ROLE HIERARCHY &amp; SLOTS ⚔
            </span>
            {slotsQuery.isLoading && (
              <span
                data-ocid="role_hierarchy.loading_state"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "0.9rem",
                  color: "oklch(0.60 0.14 295)",
                  marginLeft: "auto",
                }}
              >
                loading slots...
              </span>
            )}
            {setSlotMutation.isError && (
              <span
                data-ocid="role_hierarchy.error_state"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "0.9rem",
                  color: "oklch(0.72 0.20 25)",
                  marginLeft: "auto",
                }}
              >
                ⚠ failed to update slot
              </span>
            )}
          </div>

          {/* Roles list */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RANKS.map((r, index) => {
                const slots = slotsMap.get(r.rank) ?? r.defaultSlots;
                const memberCount = memberCountMap.get(r.rank) ?? 0;
                const isMutating = mutatingRank === r.rank;
                return (
                  <div
                    key={r.rank}
                    data-ocid={`role_hierarchy.item.${index + 1}`}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                    style={{
                      background: r.bgColor,
                      border: `1px solid ${r.borderColor}`,
                      borderLeftWidth: "4px",
                      borderLeftColor: r.accentColor,
                      opacity: isMutating ? 0.6 : 1,
                      transition: "opacity 0.15s",
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
                        {r.emoji}
                      </span>
                      <span
                        className="font-pixel truncate"
                        style={{
                          fontSize: "0.52rem",
                          color: r.accentColor,
                          letterSpacing: "0.06em",
                          textShadow: "1px 1px 0 oklch(0.07 0.03 295)",
                        }}
                      >
                        {r.label}
                      </span>
                    </div>

                    {/* Per-rank stepper (Administrator) or read-only badge (others) */}
                    {isAdministrator ? (
                      <SlotStepper
                        rank={r.rank}
                        label={r.label}
                        slots={slots}
                        memberCount={memberCount}
                        accentColor={r.accentColor}
                        borderColor={r.borderColor}
                        disabled={setSlotMutation.isPending}
                        onDecrement={handleDecrement}
                        onIncrement={handleIncrement}
                      />
                    ) : (
                      <div
                        className="flex-shrink-0 flex items-center gap-1 px-2 py-1"
                        style={{
                          background: "oklch(0.10 0.04 295)",
                          border: `1px solid ${r.borderColor}`,
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
                            color: r.accentColor,
                            lineHeight: 1,
                          }}
                        >
                          {slots}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
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
