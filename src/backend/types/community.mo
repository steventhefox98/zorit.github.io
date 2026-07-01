import Common "common";

module {
  /// Identifier for a community post — monotonically increasing.
  public type PostId = Nat;

  /// Identifier for a comment on a post — monotonically increasing.
  public type CommentId = Nat;

  /// The three community post kinds, shared across the feature.
  public type PostType = {
    #bugReport;
    #suggestion;
    #eventSuggestion;
  };

  /// A staff member's vote on a post. Staff can change their existing vote.
  public type VoteStatus = {
    #approved;
    #rejected;
  };

  /// A single community post. `authorUsername` is stored as given
  /// (case-insensitive matching is applied at lookup time). `createdAt` is
  /// nanoseconds since epoch.
  public type Post = {
    id : PostId;
    postType : PostType;
    title : Text;
    body : Text;
    authorUsername : Common.Username;
    createdAt : Common.Timestamp;
  };

  /// A single vote cast by a staff member on a post.
  public type Vote = {
    postId : PostId;
    voterUsername : Common.Username;
    status : VoteStatus;
    timestamp : Common.Timestamp;
  };

  /// A single comment on a post. Only staff (Administrator/CoAdministrator) and
  /// the original post submitter may comment; all other members are rejected.
  public type Comment = {
    id : CommentId;
    postId : PostId;
    authorUsername : Common.Username;
    content : Text;
    timestamp : Common.Timestamp;
  };

  /// Return shape of createPost — postId is null on failure (e.g. daily cap
  /// reached).
  public type CreatePostResult = {
    success : Bool;
    postId : ?PostId;
  };

  /// Return shape of voteOnPost — false if the voter is not staff or the post
  /// does not exist.
  public type VoteResult = {
    success : Bool;
  };

  /// Return shape of addComment — commentId is null on failure (e.g. author is
  /// neither staff nor the post submitter).
  public type AddCommentResult = {
    success : Bool;
    commentId : ?CommentId;
  };

  /// Aggregated vote counts for a single post.
  public type VoteTally = {
    postId : PostId;
    approved : Nat;
    rejected : Nat;
  };
};
