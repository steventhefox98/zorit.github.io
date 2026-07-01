import Common "common";
import AuthTypes "auth-roles-applications";

module {
  /// Identifier for a roster member entry — monotonically increasing.
  public type RosterMemberId = Nat;

  /// A single staff roster entry. `name` is the display name shown on the
  /// Team page; `rank` is the role group the member belongs to. `id` is
  /// stable across edits so remove operations can target a specific entry.
  public type RosterMember = {
    id : RosterMemberId;
    name : Text;
    rank : AuthTypes.RosterRank;
  };

  /// Return shape of addStaffRosterMember — memberId is null on failure
  /// (e.g. caller is not an Administrator).
  public type AddRosterMemberResult = {
    success : Bool;
    memberId : ?RosterMemberId;
  };

  /// Return shape of removeStaffRosterMember — false if the member id does
  /// not exist or the caller is not an Administrator.
  public type RemoveRosterMemberResult = {
    success : Bool;
  };

  /// Return shape of acceptApplication (two-step accept). `success` is false
  /// if the application id does not exist, is not Pending, or the caller is
  /// not an Administrator (Co-Administrators are view-only for the accept
  /// step). On success the applicant's user role is promoted to the chosen
  /// staff role.
  public type AcceptApplicationResult = {
    success : Bool;
  };

  /// Return shape of getRoster — the full roster grouped by rank. Returns
  /// the seed defaults when the backend roster is empty so the Team page can
  /// fall back to the hardcoded list.
  public type RosterGroup = {
    rank : AuthTypes.RosterRank;
    members : [RosterMember];
  };

  /// A single rank's editable slot count (max members). One entry per
  /// RosterRank, stored persistently in the backend so admins can adjust
  /// capacity per rank. Initialized to sensible defaults on first load
  /// (see defaultRankSlots in lib/staff-roster-and-applications.mo).
  public type RankSlot = {
    rank : AuthTypes.RosterRank;
    slots : Nat;
  };

  /// Return shape of setRankSlot — false if the caller is not an
  /// Administrator or the rank is invalid.
  public type SetRankSlotResult = {
    success : Bool;
  };
};
