import Common "common";
import AuthTypes "auth-roles-applications";

module {
  /// A single user entry in the admin user-management panel. Carries the
  /// user's current access tier (`role`) and, when the user is on the staff
  /// roster, their roster rank so the admin dropdown can display the rank
  /// label alongside the username. `rank` is null for users who are not on
  /// the roster (e.g. plain Members or seed Administrators without a roster
  /// entry). This shape mirrors Messaging.StaffDirectoryEntry so the admin
  /// panel and the staff directory render the same row anatomy.
  public type UserEntry = {
    username : Common.Username;
    role : AuthTypes.Role;
    rank : ?AuthTypes.RosterRank;
  };

  /// Return shape of setRole — `success` is false when the caller is not an
  /// Administrator, the target user does not exist, or the roster update
  /// could not be applied. `error` carries an optional human-readable reason
  /// on failure (null on success).
  public type SetRoleResult = {
    success : Bool;
    error : ?Text;
  };
};
