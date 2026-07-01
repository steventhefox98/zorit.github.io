import StaffRosterApplications "../lib/staff-roster-and-applications";
import AuthRolesApplications "../lib/auth-roles-applications";
import Types "../types/staff-roster-and-applications";
import AuthTypes "../types/auth-roles-applications";

mixin (state : StaffRosterApplications.State, authState : AuthRolesApplications.State) {
  /// Return the full staff roster grouped by rank. Public query — visible
  /// to all users so the Team page can load on mount. Returns seed defaults
  /// when the backend roster is empty.
  public query func getRoster() : async [Types.RosterGroup] {
    StaffRosterApplications.getRoster(state);
  };

  /// Return all rank slot counts (max members per rank), ordered by the
  /// canonical rank order. Public query.
  public query func getRankSlots() : async [Types.RankSlot] {
    StaffRosterApplications.getRankSlots(state);
  };

  /// Set a single rank's slot count (max members). Administrator-only.
  public shared ({ caller }) func setRankSlot(callerUsername : Text, rank : AuthTypes.RosterRank, slots : Nat) : async Types.SetRankSlotResult {
    ignore caller;
    StaffRosterApplications.setRankSlot(state, authState, callerUsername, rank, slots);
  };

  /// Add a new member to the roster under the given rank. Administrator-only.
  public shared ({ caller }) func addStaffRosterMember(callerUsername : Text, name : Text, rank : AuthTypes.RosterRank) : async Types.AddRosterMemberResult {
    ignore caller;
    StaffRosterApplications.addStaffRosterMember(state, authState, callerUsername, name, rank);
  };

  /// Remove a member from the roster by id. Administrator-only.
  public shared ({ caller }) func removeStaffRosterMember(callerUsername : Text, memberId : Nat) : async Types.RemoveRosterMemberResult {
    ignore caller;
    StaffRosterApplications.removeStaffRosterMember(state, authState, callerUsername, memberId);
  };

  /// Two-step accept: mark the application Accepted and promote the
  /// applicant's user role to the chosen staff role. Administrator-only.
  /// For a Developer application, pass #Developer as assignedRank.
  public shared ({ caller }) func acceptApplication(callerUsername : Text, applicationId : Nat, assignedRank : AuthTypes.RosterRank) : async Types.AcceptApplicationResult {
    ignore caller;
    StaffRosterApplications.acceptApplication(state, authState, callerUsername, applicationId, assignedRank);
  };

  /// Update an existing roster member's rank in place. Administrator-only
  /// (shared update, not query). Validates the target rank against its slot
  /// capacity and updates the member's rank without removing and re-adding
  /// the entry, so the member id is preserved. The caller's auth state and
  /// username are resolved by the lib function (Administrator-only).
  public shared ({ caller }) func updateStaffRosterMember(callerUsername : Text, memberId : Nat, targetRank : AuthTypes.RosterRank) : async Types.UpdateStaffRosterMemberResult {
    ignore caller;
    StaffRosterApplications.updateStaffRosterMember(state, authState, callerUsername, memberId, targetRank);
  };

  /// Decline an application (single-step). Returns false if the application
  /// id does not exist.
  public shared ({ caller }) func declineApplication(applicationId : Nat) : async Bool {
    ignore caller;
    StaffRosterApplications.declineApplication(authState, applicationId);
  };
};
