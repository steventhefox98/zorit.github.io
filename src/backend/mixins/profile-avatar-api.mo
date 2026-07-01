import ProfileAvatar "../lib/profile-avatar";
import AuthRolesApplications "../lib/auth-roles-applications";
import Types "../types/profile-avatar";

mixin (authState : AuthRolesApplications.State) {
  /// Set the calling user's own avatar. Callable only by an authenticated
  /// user (the caller's username must exist in the user map). Returns
  /// { success = false } if the caller does not exist.
  public shared ({ caller }) func setMyAvatar(username : Text, avatar : Types.Avatar) : async Types.SetAvatarResult {
    ignore caller;
    ProfileAvatar.setMyAvatar(authState, username, avatar);
  };

  /// Fetch a user's avatar by username. Returns null if the user does not
  /// exist or has no avatar set.
  public query func getAvatar(username : Text) : async ?Types.Avatar {
    ProfileAvatar.getAvatar(authState, username);
  };
};
