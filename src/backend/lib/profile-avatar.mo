import Map "mo:core/Map";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Types "../types/profile-avatar";
import AuthTypes "../types/auth-roles-applications";
import Common "../types/common";

module {
  /// Auth state slice required for avatar lookups. Mirrors the users field
  /// of AuthRolesApplications.State.
  public type AuthState = {
    users : Map.Map<Common.Username, AuthTypes.User>;
  };

  /// Set the calling user's avatar. The caller is identified by username
  /// (case-insensitive). Returns { success = false } if the user does not
  /// exist. On success the user record is updated in place with the new
  /// avatar value.
  public func setMyAvatar(authState : AuthState, username : Common.Username, avatar : Types.Avatar) : Types.SetAvatarResult {
    let normalized = toLower(username);
    switch (authState.users.get(normalized)) {
      case null { { success = false } };
      case (?user) {
        authState.users.add(normalized, { user with avatar = ?avatar });
        { success = true };
      };
    };
  };

  /// Look up a user's avatar by username (case-insensitive). Returns null if
  /// the user does not exist or has no avatar set.
  public func getAvatar(authState : AuthState, username : Common.Username) : ?Types.Avatar {
    let normalized = toLower(username);
    switch (authState.users.get(normalized)) {
      case (?user) user.avatar;
      case null null;
    };
  };

  /// Lowercase a Text value (ASCII-only; sufficient for username matching).
  func toLower(text : Text) : Text {
    text.map(func(char : Char) : Char {
      if (char >= 'A' and char <= 'Z') {
        Char.fromNat32(char.toNat32() + 32);
      } else {
        char;
      };
    });
  };
};
