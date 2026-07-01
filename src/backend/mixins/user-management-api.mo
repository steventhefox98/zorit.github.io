import UserManagement "../lib/user-management";
import AuthRolesApplications "../lib/auth-roles-applications";
import StaffRosterApplications "../lib/staff-roster-and-applications";
import Types "../types/user-management";
import AuthTypes "../types/auth-roles-applications";

mixin (authState : AuthRolesApplications.State, rosterState : StaffRosterApplications.State) {
  /// Return every registered user for the admin user-management dropdown
  /// panel. Public query — the frontend gates the panel to Administrators,
  /// and the backend setRole mutation enforces the strict === #Administrator
  /// check. Each entry carries the user's current role and, when on the
  /// roster, their roster rank.
  public query func getAllUsers() : async [Types.UserEntry] {
    UserManagement.getAllUsers(
      { users = authState.users },
      { roster = rosterState.roster; var nextRosterMemberId = rosterState.nextRosterMemberId },
    );
  };

  /// Set a single user's role to any of the 16 Role variants.
  /// Administrator-only (strict === #Administrator via isAdminRole —
  /// Co-Administrators are view-only). The target user is looked up
  /// case-insensitively. Assigning a roster rank also adds the user to the
  /// roster under that rank if not already present. Returns
  /// { success = false; error = ?"..." } on failure.
  public shared ({ caller }) func setRole(callerUsername : Text, targetUsername : Text, newRole : AuthTypes.Role) : async Types.SetRoleResult {
    ignore caller;
    UserManagement.setRole(
      { users = authState.users },
      { roster = rosterState.roster; var nextRosterMemberId = rosterState.nextRosterMemberId },
      callerUsername,
      targetUsername,
      newRole,
    );
  };
};
