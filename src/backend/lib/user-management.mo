import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Types "../types/user-management";
import AuthTypes "../types/auth-roles-applications";
import StaffRosterTypes "../types/staff-roster-and-applications";
import StaffRosterApplications "../lib/staff-roster-and-applications";
import Common "../types/common";

module {
  /// Shape of the auth state slice required for enumerating users and
  /// promoting a target user's role. Mirrors the `users` field of
  /// AuthRolesApplications.State.
  public type AuthState = {
    users : Map.Map<Common.Username, AuthTypes.User>;
  };

  /// Shape of the roster state slice required to look up each user's roster
  /// rank for the admin user list, and to add a roster member when a roster
  /// rank is assigned via setRole. Mirrors the `roster` and
  /// `nextRosterMemberId` fields of StaffRosterApplications.State.
  public type RosterState = {
    roster : Map.Map<StaffRosterTypes.RosterMemberId, StaffRosterTypes.RosterMember>;
    var nextRosterMemberId : StaffRosterTypes.RosterMemberId;
  };

  /// Return every registered user — iterating authState.users.toArray()
  /// WITHOUT the isStaffRole filter (unlike Messaging.getStaffDirectory) so
  /// the admin dropdown panel lists all users regardless of role. Each entry
  /// carries the user's current access tier (`role`) and, when the user is
  /// on the roster, their roster rank. The roster is keyed by RosterMemberId
  /// and members store their display name in `name` (set to the applicant's
  /// username by acceptApplication), so we build a case-insensitive
  /// username -> RosterRank lookup from the roster once and join it against
  /// the user list.
  public func getAllUsers(authState : AuthState, rosterState : RosterState) : [Types.UserEntry] {
    // Build a case-insensitive username -> RosterRank index from the roster
    // so each user can be matched to their rank in one pass. Same pattern as
    // Messaging.getStaffDirectory.
    let rankByUsername = Map.empty<Common.Username, AuthTypes.RosterRank>();
    for ((_id, member) in rosterState.roster.entries()) {
      rankByUsername.add(toLower(member.name), member.rank);
    };

    authState.users.toArray().map(
      func((_username, user)) {
        let rank = rankByUsername.get(toLower(user.username));
        { username = user.username; role = user.role; rank };
      }
    );
  };

  /// Set a single user's role to any of the 16 Role variants. Caller must be
  /// an Administrator (strict === #Administrator via the existing
  /// isAdminRole helper — Co-Administrators are view-only). The target user
  /// is looked up case-insensitively (matching register/login). When the new
  /// role is a roster rank, the user is added to the roster under that rank
  /// if not already present (matching acceptApplication's
  /// addStaffRosterMember logic) so the Team page stays consistent. When the
  /// new role is #Administrator, #CoAdministrator, or #Member, the user is
  /// removed from the roster if they were a roster member (since they're no
  /// longer staff). Returns { success = false; error = ?"..." } on failure.
  public func setRole(authState : AuthState, rosterState : RosterState, callerUsername : Common.Username, targetUsername : Common.Username, newRole : AuthTypes.Role) : Types.SetRoleResult {
    // Admin gate — strict === #Administrator via the existing helper.
    let callerRole = StaffRosterApplications.lookupRole(
      { users = authState.users; applications = Map.empty() },
      callerUsername,
    );
    switch (callerRole) {
      case null { return { success = false; error = ?"Administrator only" } };
      case (?role) {
        if (not StaffRosterApplications.isAdminRole(role)) {
          return { success = false; error = ?"Administrator only" };
        };
      };
    };

    // Look up the target user case-insensitively (register/login pattern).
    let normalized = toLower(targetUsername);
    switch (authState.users.get(normalized)) {
      case null { { success = false; error = ?"User not found" } };
      case (?user) {
        // Update the user's role in the users map via record spread.
        authState.users.add(normalized, { user with role = newRole });

        // Manage roster membership based on the new role.
        switch (newRole) {
          // Roster ranks — ensure the user is on the roster under this rank.
          case (#Owner or #CoOwner or #Manager or #AdvertiseManager or #ChiefAdmin or #SrDeveloper or #Developer or #Admin or #JrAdmin or #Mod or #Cop or #Builder or #SrCop) {
            let rosterRank = roleToRosterRank(newRole);
            // Check if the user is already on the roster (case-insensitive
            // name match). If not, add them under the new rank.
            let alreadyOnRoster = rosterState.roster.toArray().any(
              func((_id, member)) : Bool { toLower(member.name) == normalized }
            );
            if (not alreadyOnRoster) {
              let id = rosterState.nextRosterMemberId;
              let member : StaffRosterTypes.RosterMember = {
                id;
                name = user.username;
                rank = rosterRank;
              };
              rosterState.roster.add(id, member);
              rosterState.nextRosterMemberId := id + 1;
            };
          };
          // Non-staff roles — remove the user from the roster if present.
          case (#Administrator or #CoAdministrator or #Member) {
            let toRemove = rosterState.roster.toArray().filter(
              func((_id, member)) : Bool { toLower(member.name) == normalized }
            );
            for ((id, _member) in toRemove.vals()) {
              rosterState.roster.remove(id);
            };
          };
        };
        { success = true; error = null };
      };
    };
  };

  /// Lowercase a Text value (ASCII-only; sufficient for username matching).
  func toLower(text : Text) : Text {
    text.map(func(char : Char) : Char {
      if (char >= 'A' and char <= 'Z') {
        Nat32.toChar(char.toNat32() + 32);
      } else {
        char;
      };
    });
  };

  /// Convert a roster-rank Role back to its RosterRank variant. The Role
  /// enum reuses the same constructor names as RosterRank for the 13 roster
  /// ranks; this helper narrows a Role that is already known to be a roster
  /// rank back to the RosterRank type for roster storage.
  func roleToRosterRank(role : AuthTypes.Role) : AuthTypes.RosterRank {
    switch (role) {
      case (#Owner) #Owner;
      case (#CoOwner) #CoOwner;
      case (#Manager) #Manager;
      case (#AdvertiseManager) #AdvertiseManager;
      case (#ChiefAdmin) #ChiefAdmin;
      case (#SrDeveloper) #SrDeveloper;
      case (#Developer) #Developer;
      case (#Admin) #Admin;
      case (#JrAdmin) #JrAdmin;
      case (#Mod) #Mod;
      case (#Cop) #Cop;
      case (#Builder) #Builder;
      case (#SrCop) #SrCop;
      case (#Administrator or #CoAdministrator or #Member) {
        // Unreachable — caller only invokes this for roster-rank roles.
        #Builder;
      };
    };
  };
};
