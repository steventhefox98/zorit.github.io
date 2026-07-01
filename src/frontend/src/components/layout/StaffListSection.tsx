import { type RosterGroup, type RosterMember, RosterRank } from "@/backend";
import { Role } from "@/backend";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAddStaffRosterMember,
  useRemoveStaffRosterMember,
  useRoster,
} from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types + seed defaults (fallback when backend is empty/loading)     */
/* ------------------------------------------------------------------ */

interface StaffMemberSeed {
  name: string;
  occupied: boolean;
}

interface StaffRoleSeed {
  title: string;
  rank: RosterRank;
  members: StaffMemberSeed[];
  accentColor: string;
  borderColor: string;
  bgColor: string;
}

const RANK_ORDER: RosterRank[] = [
  RosterRank.Owner,
  RosterRank.CoOwner,
  RosterRank.Manager,
  RosterRank.AdvertiseManager,
  RosterRank.ChiefAdmin,
  RosterRank.SrDeveloper,
  RosterRank.Developer,
  RosterRank.Admin,
  RosterRank.JrAdmin,
  RosterRank.Mod,
  RosterRank.Cop,
  RosterRank.Builder,
  RosterRank.SrCop,
];

const RANK_LABELS: Record<RosterRank, string> = {
  [RosterRank.Owner]: "Owner",
  [RosterRank.CoOwner]: "Co-Owner",
  [RosterRank.Manager]: "Manager",
  [RosterRank.AdvertiseManager]: "Advertise Manager",
  [RosterRank.ChiefAdmin]: "Chief Admin",
  [RosterRank.SrDeveloper]: "SR. Developer",
  [RosterRank.Developer]: "Developer",
  [RosterRank.Admin]: "Admin",
  [RosterRank.JrAdmin]: "JR. Admin",
  [RosterRank.Mod]: "Mod",
  [RosterRank.Cop]: "Cop",
  [RosterRank.Builder]: "Builder",
  [RosterRank.SrCop]: "Sr-Cop",
};

const ROLE_TITLE_DECOR: Record<
  RosterRank,
  { title: string; accent: string; border: string; bg: string }
> = {
  [RosterRank.Owner]: {
    title: "👑Owner👑",
    accent: "oklch(0.78 0.22 80)",
    border: "oklch(0.52 0.20 80)",
    bg: "oklch(0.15 0.07 80)",
  },
  [RosterRank.CoOwner]: {
    title: "🎩Co-Owner🎩",
    accent: "oklch(0.72 0.20 295)",
    border: "oklch(0.48 0.18 295)",
    bg: "oklch(0.15 0.07 295)",
  },
  [RosterRank.Manager]: {
    title: "🎓Manager🎓",
    accent: "oklch(0.68 0.18 220)",
    border: "oklch(0.45 0.15 220)",
    bg: "oklch(0.14 0.06 220)",
  },
  [RosterRank.AdvertiseManager]: {
    title: "🦋Advertise Manager🦋",
    accent: "oklch(0.70 0.20 330)",
    border: "oklch(0.48 0.17 330)",
    bg: "oklch(0.14 0.06 330)",
  },
  [RosterRank.ChiefAdmin]: {
    title: "🐦‍🔥Chief Admin🐦‍🔥",
    accent: "oklch(0.68 0.22 25)",
    border: "oklch(0.46 0.18 25)",
    bg: "oklch(0.14 0.06 25)",
  },
  [RosterRank.SrDeveloper]: {
    title: "🐉 SR. Developer 🐉",
    accent: "oklch(0.65 0.22 145)",
    border: "oklch(0.44 0.18 145)",
    bg: "oklch(0.14 0.06 145)",
  },
  [RosterRank.Developer]: {
    title: "🐍 Developer 🐍",
    accent: "oklch(0.62 0.20 145)",
    border: "oklch(0.42 0.16 145)",
    bg: "oklch(0.13 0.05 145)",
  },
  [RosterRank.Admin]: {
    title: "🌺 Admin 🌺",
    accent: "oklch(0.70 0.20 350)",
    border: "oklch(0.48 0.17 350)",
    bg: "oklch(0.14 0.06 350)",
  },
  [RosterRank.JrAdmin]: {
    title: "🍄 JR. Admin 🍄",
    accent: "oklch(0.65 0.18 40)",
    border: "oklch(0.44 0.15 40)",
    bg: "oklch(0.14 0.05 40)",
  },
  [RosterRank.Mod]: {
    title: "🍂 Mod 🍂",
    accent: "oklch(0.65 0.18 55)",
    border: "oklch(0.44 0.15 55)",
    bg: "oklch(0.14 0.05 55)",
  },
  [RosterRank.Cop]: {
    title: "🚔 Cop 🚔",
    accent: "oklch(0.66 0.16 220)",
    border: "oklch(0.44 0.13 220)",
    bg: "oklch(0.14 0.06 220)",
  },
  [RosterRank.Builder]: {
    title: "🎋 Builder 🎋",
    accent: "oklch(0.62 0.16 145)",
    border: "oklch(0.42 0.13 145)",
    bg: "oklch(0.13 0.05 145)",
  },
  [RosterRank.SrCop]: {
    title: "🚓 Sr-Cop 🚓",
    accent: "oklch(0.66 0.18 200)",
    border: "oklch(0.44 0.15 200)",
    bg: "oklch(0.14 0.06 200)",
  },
};

const SEED_ROSTER: StaffRoleSeed[] = [
  {
    title: "👑Owner👑",
    rank: RosterRank.Owner,
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
    rank: RosterRank.CoOwner,
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
    rank: RosterRank.Manager,
    members: [{ name: "UNOCCUPIED", occupied: false }],
    accentColor: "oklch(0.68 0.18 220)",
    borderColor: "oklch(0.45 0.15 220)",
    bgColor: "oklch(0.14 0.06 220)",
  },
  {
    title: "🦋Advertise Manager🦋",
    rank: RosterRank.AdvertiseManager,
    members: [{ name: "UNOCCUPIED", occupied: false }],
    accentColor: "oklch(0.70 0.20 330)",
    borderColor: "oklch(0.48 0.17 330)",
    bgColor: "oklch(0.14 0.06 330)",
  },
  {
    title: "🐦‍🔥Chief Admin🐦‍🔥",
    rank: RosterRank.ChiefAdmin,
    members: [{ name: "UNOCCUPIED", occupied: false }],
    accentColor: "oklch(0.68 0.22 25)",
    borderColor: "oklch(0.46 0.18 25)",
    bgColor: "oklch(0.14 0.06 25)",
  },
  {
    title: "🐉 SR. Developer 🐉",
    rank: RosterRank.SrDeveloper,
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
    rank: RosterRank.Developer,
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
    rank: RosterRank.Admin,
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
    rank: RosterRank.JrAdmin,
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
    rank: RosterRank.Mod,
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
    title: "🚔 Cop 🚔",
    rank: RosterRank.Cop,
    members: [
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
      { name: "UNOCCUPIED", occupied: false },
    ],
    accentColor: "oklch(0.66 0.16 220)",
    borderColor: "oklch(0.44 0.13 220)",
    bgColor: "oklch(0.14 0.06 220)",
  },
  {
    title: "🎋 Builder 🎋",
    rank: RosterRank.Builder,
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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function isAdminRole(role: Role | null): boolean {
  return role === Role.Administrator || role === Role.CoAdministrator;
}

/** A unified display row: either a real backend member or a seed placeholder. */
interface DisplayMember {
  id: bigint | null; // null = seed placeholder (not removable)
  name: string;
  occupied: boolean;
}

interface DisplayGroup {
  rank: RosterRank;
  title: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  members: DisplayMember[];
}

/** Build the display list: backend roster if present, else seed defaults. */
function buildDisplayGroups(roster: RosterGroup[] | undefined): DisplayGroup[] {
  if (roster && roster.length > 0) {
    // Sort by canonical rank order, then map.
    return [...roster]
      .sort((a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank))
      .map((group) => {
        const decor = ROLE_TITLE_DECOR[group.rank];
        const members: DisplayMember[] = group.members.map(
          (m: RosterMember) => ({
            id: m.id,
            name: m.name,
            occupied: true,
          }),
        );
        return {
          rank: group.rank,
          title: decor?.title ?? RANK_LABELS[group.rank],
          accentColor: decor?.accent ?? "oklch(0.68 0.20 295)",
          borderColor: decor?.border ?? "oklch(0.45 0.15 295)",
          bgColor: decor?.bg ?? "oklch(0.14 0.06 295)",
          members,
        };
      });
  }

  // Fallback: seed defaults (read-only placeholders, not removable).
  return SEED_ROSTER.map((seed) => ({
    rank: seed.rank,
    title: seed.title,
    accentColor: seed.accentColor,
    borderColor: seed.borderColor,
    bgColor: seed.bgColor,
    members: seed.members.map((m) => ({
      id: null,
      name: m.name,
      occupied: m.occupied,
    })),
  }));
}

/* ------------------------------------------------------------------ */
/*  Add-staff modal                                                    */
/* ------------------------------------------------------------------ */

interface AddStaffModalProps {
  open: boolean;
  defaultRank: RosterRank;
  onClose: () => void;
  onSubmit: (name: string, rank: RosterRank) => void;
  submitting: boolean;
  error: string | null;
}

function AddStaffModal({
  open,
  defaultRank,
  onClose,
  onSubmit,
  submitting,
  error,
}: AddStaffModalProps) {
  const [name, setName] = useState("");
  const [rank, setRank] = useState<RosterRank>(defaultRank);

  // Reset form whenever the modal (re)opens with a new default rank.
  useEffect(() => {
    if (open) {
      setName("");
      setRank(defaultRank);
    }
  }, [open, defaultRank]);

  // Escape to close + focus trap-ish: focus the name input on open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, submitting]);

  if (!open) return null;

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmed, rank);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0.05 0.03 295 / 0.75)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !submitting) onClose();
      }}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: pixel-bordered modal styling relies on div */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add staff member"
        data-ocid="staff.add_member.dialog"
        className="w-full max-w-md"
        style={{
          background: "oklch(0.12 0.06 295)",
          border: "3px solid oklch(0.55 0.22 295)",
          boxShadow: "8px 8px 0 oklch(0.07 0.03 295)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: "oklch(0.18 0.10 295)",
            borderBottom: "2px solid oklch(0.32 0.16 295)",
          }}
        >
          <span
            className="font-pixel"
            style={{
              fontSize: "0.6rem",
              color: "oklch(0.78 0.22 295)",
              letterSpacing: "0.1em",
              textShadow: "1px 1px 0 oklch(0.07 0.03 295)",
            }}
          >
            ⚑ ADD STAFF MEMBER
          </span>
          <button
            type="button"
            data-ocid="staff.add_member.close_button"
            aria-label="Close add staff dialog"
            onClick={onClose}
            disabled={submitting}
            className="font-pixel transition-colors"
            style={{
              fontSize: "0.7rem",
              color: "oklch(0.65 0.18 295)",
              background: "transparent",
              border: "2px solid oklch(0.40 0.16 295)",
              padding: "2px 8px",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.5 : 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Name field */}
          <div className="space-y-2">
            <label
              htmlFor="staff-add-name"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.15rem",
                color: "oklch(0.78 0.16 295)",
                letterSpacing: "0.04em",
              }}
            >
              ▸ Staff Name
            </label>
            <input
              id="staff-add-name"
              type="text"
              value={name}
              data-ocid="staff.add_member.name_input"
              onChange={(e) => setName(e.target.value)}
              maxLength={48}
              placeholder="Enter username..."
              disabled={submitting}
              style={{
                width: "100%",
                background: "oklch(0.08 0.04 295)",
                border: "2px solid oklch(0.40 0.16 295)",
                color: "oklch(0.92 0.06 295)",
                fontFamily: '"VT323", monospace',
                fontSize: "1.2rem",
                padding: "8px 12px",
                letterSpacing: "0.03em",
                outline: "none",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "oklch(0.62 0.22 295)";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "oklch(0.40 0.16 295)";
              }}
            />
          </div>

          {/* Rank picker */}
          <div className="space-y-2">
            <label
              htmlFor="staff-add-rank"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.15rem",
                color: "oklch(0.78 0.16 295)",
                letterSpacing: "0.04em",
              }}
            >
              ▸ Assign Rank
            </label>
            <select
              id="staff-add-rank"
              value={rank}
              data-ocid="staff.add_member.rank_select"
              onChange={(e) => setRank(e.target.value as RosterRank)}
              disabled={submitting}
              style={{
                width: "100%",
                background: "oklch(0.08 0.04 295)",
                border: "2px solid oklch(0.40 0.16 295)",
                color: "oklch(0.92 0.06 295)",
                fontFamily: '"VT323", monospace',
                fontSize: "1.2rem",
                padding: "8px 12px",
                letterSpacing: "0.03em",
                cursor: "pointer",
                outline: "none",
              }}
              onFocus={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "oklch(0.62 0.22 295)";
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "oklch(0.40 0.16 295)";
              }}
            >
              {RANK_ORDER.map((r) => (
                <option
                  key={r}
                  value={r}
                  style={{
                    background: "oklch(0.12 0.06 295)",
                    color: "oklch(0.92 0.06 295)",
                  }}
                >
                  {RANK_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div
              data-ocid="staff.add_member.error_state"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1.05rem",
                color: "oklch(0.72 0.20 25)",
                background: "oklch(0.16 0.08 25)",
                border: "2px solid oklch(0.50 0.18 25)",
                padding: "6px 10px",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              data-ocid="staff.add_member.cancel_button"
              onClick={onClose}
              disabled={submitting}
              className="font-pixel transition-colors"
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                color: "oklch(0.70 0.14 295)",
                background: "oklch(0.16 0.08 295)",
                border: "2px solid oklch(0.36 0.14 295)",
                padding: "8px 14px",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.5 : 1,
              }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              data-ocid="staff.add_member.submit_button"
              disabled={!canSubmit}
              className="font-pixel transition-colors"
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                color: "oklch(0.99 0 0)",
                background: canSubmit
                  ? "oklch(0.45 0.20 295)"
                  : "oklch(0.28 0.10 295)",
                border: "2px solid oklch(0.55 0.22 295)",
                boxShadow: canSubmit
                  ? "0 3px 0 oklch(0.22 0.12 295), inset 0 1px 0 oklch(0.62 0.22 295)"
                  : "none",
                padding: "8px 14px",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {submitting ? "ADDING..." : "+ ADD MEMBER"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section                                                       */
/* ------------------------------------------------------------------ */

export default function StaffListSection() {
  const { username, role } = useAuth();
  const canEdit = isAdminRole(role);

  const rosterQuery = useRoster();
  const addMutation = useAddStaffRosterMember();
  const removeMutation = useRemoveStaffRosterMember();

  const groups = useMemo(
    () => buildDisplayGroups(rosterQuery.data),
    [rosterQuery.data],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalRank, setModalRank] = useState<RosterRank>(RosterRank.Mod);
  const [modalError, setModalError] = useState<string | null>(null);

  const openAddModal = (rank: RosterRank) => {
    setModalRank(rank);
    setModalError(null);
    setModalOpen(true);
  };

  const handleSubmitAdd = async (name: string, rank: RosterRank) => {
    if (!username) {
      setModalError("You must be logged in to edit the roster.");
      return;
    }
    setModalError(null);
    try {
      const result = await addMutation.mutateAsync({
        callerUsername: username,
        name,
        rank,
      });
      if (!result.success) {
        setModalError(
          "Backend rejected the add. Check permissions and try again.",
        );
        return;
      }
      setModalOpen(false);
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Failed to add staff member.",
      );
    }
  };

  const handleRemove = (member: DisplayMember) => {
    if (!username || member.id === null) return;
    if (!window.confirm(`Remove "${member.name}" from the roster?`)) return;
    removeMutation.mutate({
      callerUsername: username,
      memberId: member.id,
    });
  };

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
          {canEdit && (
            <p
              data-ocid="staff.admin_mode.banner"
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1rem",
                color: "oklch(0.72 0.20 145)",
                marginTop: "0.5rem",
                letterSpacing: "0.04em",
              }}
            >
              ⚒ Admin mode — edit controls enabled
            </p>
          )}
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
            {rosterQuery.isLoading && (
              <span
                data-ocid="staff.loading_state"
                style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: "0.9rem",
                  color: "oklch(0.60 0.14 295)",
                  marginLeft: "auto",
                }}
              >
                loading roster...
              </span>
            )}
          </div>

          {/* Roles list */}
          <div className="p-4 sm:p-6 space-y-0">
            {groups.map((group, roleIndex) => {
              const occupiedCount = group.members.filter(
                (m) => m.occupied,
              ).length;
              return (
                <div key={group.rank}>
                  {/* Role header */}
                  <div
                    className="flex w-full items-center gap-3 px-4 py-3"
                    style={{
                      background: group.bgColor,
                      borderLeft: `4px solid ${group.accentColor}`,
                      borderTop: `1px solid ${group.borderColor}`,
                      borderRight: `1px solid ${group.borderColor}`,
                      borderBottom: `1px solid ${group.borderColor}`,
                    }}
                  >
                    <span
                      className="font-pixel"
                      style={{
                        fontSize: "0.58rem",
                        color: group.accentColor,
                        letterSpacing: "0.08em",
                        textShadow: "1px 1px 0 oklch(0.07 0.03 295)",
                      }}
                    >
                      @{group.title}
                    </span>
                    <span
                      style={{
                        fontFamily: '"VT323", monospace',
                        fontSize: "0.85rem",
                        color: "oklch(0.45 0.08 295)",
                      }}
                    >
                      [{occupiedCount}/{group.members.length}]
                    </span>

                    {/* Add button (admin only) */}
                    {canEdit && (
                      <button
                        type="button"
                        data-ocid={`staff.add_button.${roleIndex + 1}`}
                        aria-label={`Add staff to ${RANK_LABELS[group.rank]}`}
                        onClick={() => openAddModal(group.rank)}
                        disabled={addMutation.isPending}
                        className="font-pixel transition-colors ml-auto"
                        style={{
                          fontSize: "0.5rem",
                          letterSpacing: "0.08em",
                          color: "oklch(0.99 0 0)",
                          background: "oklch(0.45 0.20 295)",
                          border: "2px solid oklch(0.62 0.22 295)",
                          boxShadow:
                            "0 2px 0 oklch(0.22 0.12 295), inset 0 1px 0 oklch(0.62 0.22 295)",
                          padding: "4px 8px",
                          cursor: addMutation.isPending
                            ? "not-allowed"
                            : "pointer",
                          opacity: addMutation.isPending ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!addMutation.isPending)
                            (e.currentTarget as HTMLElement).style.background =
                              "oklch(0.52 0.22 295)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background =
                            "oklch(0.45 0.20 295)";
                        }}
                      >
                        + ADD
                      </button>
                    )}
                  </div>

                  {/* Members */}
                  <div
                    style={{
                      background: "oklch(0.11 0.04 295)",
                      borderLeft: `4px solid ${group.borderColor}`,
                      borderRight: "1px solid oklch(0.20 0.08 295)",
                      borderBottom: "1px solid oklch(0.20 0.08 295)",
                    }}
                  >
                    {group.members.length === 0 && (
                      <div
                        data-ocid={`staff.empty_state.${roleIndex + 1}`}
                        className="flex items-center gap-3 px-5 py-2"
                      >
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
                          No members yet
                        </span>
                      </div>
                    )}

                    {group.members.map((member, memberIndex) => (
                      <div
                        key={`${member.name}-${memberIndex}`}
                        data-ocid={`staff.item.${roleIndex + 1}.${memberIndex + 1}`}
                        className="flex items-center gap-3 px-5 py-2"
                        style={{
                          borderBottom:
                            memberIndex < group.members.length - 1
                              ? "1px solid oklch(0.16 0.06 295)"
                              : "none",
                        }}
                      >
                        {member.occupied ? (
                          <>
                            <UserAvatar
                              username={member.name}
                              size="sm"
                              alt={`${member.name}'s avatar`}
                            />
                            <span
                              className="min-w-0 flex-1 truncate"
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
                              aria-hidden="true"
                              style={{
                                display: "inline-block",
                                width: "32px",
                                height: "32px",
                                background: "oklch(0.16 0.05 295)",
                                border: "2px solid oklch(0.28 0.10 295)",
                                imageRendering: "pixelated",
                              }}
                            />
                            <span
                              className="min-w-0 flex-1"
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

                        {/* Remove button (admin only, real backend members only) */}
                        {canEdit && member.occupied && member.id !== null && (
                          <button
                            type="button"
                            data-ocid={`staff.delete_button.${roleIndex + 1}.${memberIndex + 1}`}
                            aria-label={`Remove ${member.name} from roster`}
                            onClick={() => handleRemove(member)}
                            disabled={removeMutation.isPending}
                            className="font-pixel transition-colors"
                            style={{
                              fontSize: "0.5rem",
                              letterSpacing: "0.08em",
                              color: "oklch(0.85 0.16 25)",
                              background: "oklch(0.18 0.08 25)",
                              border: "2px solid oklch(0.50 0.18 25)",
                              padding: "3px 7px",
                              cursor: removeMutation.isPending
                                ? "not-allowed"
                                : "pointer",
                              opacity: removeMutation.isPending ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!removeMutation.isPending) {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = "oklch(0.30 0.14 25)";
                                (e.currentTarget as HTMLElement).style.color =
                                  "oklch(0.99 0 0)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "oklch(0.18 0.08 25)";
                              (e.currentTarget as HTMLElement).style.color =
                                "oklch(0.85 0.16 25)";
                            }}
                          >
                            ✕ REMOVE
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Divider between roles (not after last) */}
                  {roleIndex < groups.length - 1 && (
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
              );
            })}
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
                marginBottom: "0.5rem",
              }}
            >
              ★ Interested in joining the team?
            </p>
            <Link
              to="/apply"
              className="minecraft-btn inline-block px-6 py-2.5"
              style={{
                background: "oklch(0.45 0.20 295)",
                color: "oklch(0.99 0 0)",
                boxShadow:
                  "0 3px 0 oklch(0.22 0.12 295), inset 0 1px 0 oklch(0.62 0.22 295)",
                fontFamily: '"Press Start 2P", monospace',
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.52 0.22 295)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "oklch(0.45 0.20 295)";
              }}
            >
              ✎ APPLY FOR STAFF
            </Link>
            <p
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: "1rem",
                color: "oklch(0.45 0.10 295)",
                marginTop: "0.5rem",
              }}
            >
              Statue:- Not Up-To-Date
            </p>
          </div>
        </div>
      </div>

      <AddStaffModal
        open={modalOpen}
        defaultRank={modalRank}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitAdd}
        submitting={addMutation.isPending}
        error={modalError}
      />
    </section>
  );
}
