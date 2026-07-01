import Common "common";

module {
  /// Reference to an uploaded avatar blob in object storage. `key` is the
  /// storage key under which the blob was stored; `contentType` carries the
  /// MIME type (e.g. "image/png") so the frontend can render it correctly.
  /// The actual blob bytes live in object storage, not in canister state.
  public type BlobRef = {
    key : Text;
    contentType : Text;
  };

  /// A user's profile picture. Either a preset pixel-art/Minecraft-style
  /// template identified by a short id (e.g. "steve", "enderman", "purple1"),
  /// or a reference to a user-uploaded image stored in object storage.
  public type Avatar = {
    #preset : Text;
    #uploaded : BlobRef;
  };

  /// Return shape of setMyAvatar — false if the caller does not exist.
  public type SetAvatarResult = {
    success : Bool;
  };
};
