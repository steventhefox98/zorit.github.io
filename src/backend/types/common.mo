module {
  /// Username identifier — case-insensitive on the wire, stored as given.
  public type Username = Text;

  /// Opaque password hash (stored, never the plaintext).
  public type PasswordHash = Text;

  /// Application identifier — monotonically increasing.
  public type ApplicationId = Nat;

  /// Message identifier — monotonically increasing.
  public type MessageId = Nat;

  /// Community post identifier — monotonically increasing.
  public type PostId = Nat;

  /// Community comment identifier — monotonically increasing.
  public type CommentId = Nat;

  /// Nanoseconds since epoch (Time.now()).
  public type Timestamp = Int;
};
