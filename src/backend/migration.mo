import Map "mo:core/Map";
import AuthTypes "types/auth-roles-applications";
import Common "types/common";

module {
  /// Old User record — mirrors the previously-deployed shape in
  /// .old/src/backend/types/auth-roles-applications.mo. The previous
  /// deployment already had the `avatar` field removed, so OldUser is
  /// identical to the new AuthTypes.User. Defined inline because the old
  /// types module is not importable from the sandboxed compilation
  /// environment.
  public type OldUser = AuthTypes.User;

  /// Old AppliedRole — mirrors .old/src/backend/types/auth-roles-applications.mo.
  /// The previous deployment already included the #Developer variant, so
  /// OldAppliedRole is identical to the new AuthTypes.AppliedRole.
  public type OldAppliedRole = AuthTypes.AppliedRole;

  /// Old Application record — identical to the new AuthTypes.Application
  /// because the previous deployment already used the widened AppliedRole
  /// (with #Developer).
  public type OldApplication = AuthTypes.Application;

  /// Old actor stable-state shape (mirrors .old/src/backend/main.mo). Every
  /// field name and type matches the previously-deployed actor so the
  /// upgrade-safety check accepts the migration domain.
  ///
  /// `state` is the auth/applications state record declared as a `let` in
  /// main.mo with a `var nextApplicationId` field. Because it carries a `var`
  /// field, Motoko's stable checker treats `state` itself as a stable
  /// variable (separate from the top-level `users`/`applications`/`var
  /// nextApplicationId` bindings, which share the same map/var references
  /// but are also stable in their own right). It must be declared here with
  /// the old State shape and reconstructed in run().
  public type OldState = {
    users : Map.Map<Common.Username, OldUser>;
    applications : Map.Map<Common.ApplicationId, OldApplication>;
    var nextApplicationId : Common.ApplicationId;
  };

  public type OldActor = {
    users : Map.Map<Common.Username, OldUser>;
    applications : Map.Map<Common.ApplicationId, OldApplication>;
    var nextApplicationId : Common.ApplicationId;
    state : OldState;
    messages : Map.Map<Common.MessageId, MessagingMessage>;
    var nextMessageId : Common.MessageId;
    posts : Map.Map<Nat, CommunityPost>;
    communityVotes : Map.Map<(Nat, Common.Username), CommunityVote>;
    comments : Map.Map<Nat, CommunityComment>;
    dailyCounts : Map.Map<(Text, CommunityPostType, Common.Username), Nat>;
    var nextPostId : Nat;
    var nextCommentId : Nat;
    roster : Map.Map<Nat, RosterMember>;
    rankSlots : Map.Map<AuthTypes.RosterRank, Nat>;
    var nextRosterMemberId : Nat;
  };

  /// New actor stable-state shape. Identical to OldActor because the new
  /// types (User without avatar, AppliedRole with #Developer) match the
  /// previously-deployed types exactly — the change is stable-compatible.
  /// The migration is kept as a pass-through so the `state` record (which
  /// the stable checker treats as its own stable variable due to its `var`
  /// field) is explicitly reconstructed with the new types.
  public type NewState = {
    users : Map.Map<Common.Username, AuthTypes.User>;
    applications : Map.Map<Common.ApplicationId, AuthTypes.Application>;
    var nextApplicationId : Common.ApplicationId;
  };

  public type NewActor = {
    users : Map.Map<Common.Username, AuthTypes.User>;
    applications : Map.Map<Common.ApplicationId, AuthTypes.Application>;
    var nextApplicationId : Common.ApplicationId;
    state : NewState;
    messages : Map.Map<Common.MessageId, MessagingMessage>;
    var nextMessageId : Common.MessageId;
    posts : Map.Map<Nat, CommunityPost>;
    communityVotes : Map.Map<(Nat, Common.Username), CommunityVote>;
    comments : Map.Map<Nat, CommunityComment>;
    dailyCounts : Map.Map<(Text, CommunityPostType, Common.Username), Nat>;
    var nextPostId : Nat;
    var nextCommentId : Nat;
    roster : Map.Map<Nat, RosterMember>;
    rankSlots : Map.Map<AuthTypes.RosterRank, Nat>;
    var nextRosterMemberId : Nat;
  };

  /// Inline aliases for the unchanged cross-domain record types referenced
  /// by OldActor/NewActor. These mirror the shapes in the corresponding
  /// types modules; they are structurally compatible with the new modules'
  /// types so the upgrade-safety check accepts them.
  public type MessagingMessage = {
    id : Common.MessageId;
    senderUsername : Common.Username;
    recipientUsername : Common.Username;
    content : Text;
    timestamp : Common.Timestamp;
  };

  public type CommunityPostType = {
    #bugReport;
    #suggestion;
    #eventSuggestion;
  };

  public type CommunityPost = {
    id : Nat;
    postType : CommunityPostType;
    title : Text;
    body : Text;
    authorUsername : Common.Username;
    createdAt : Common.Timestamp;
  };

  public type CommunityVote = {
    postId : Nat;
    voterUsername : Common.Username;
    status : { #approved; #rejected };
    timestamp : Common.Timestamp;
  };

  public type CommunityComment = {
    id : Nat;
    postId : Nat;
    authorUsername : Common.Username;
    content : Text;
    timestamp : Common.Timestamp;
  };

  public type RosterMember = {
    id : Nat;
    name : Text;
    rank : AuthTypes.RosterRank;
  };

  /// Upgrade migration: pass-through. The previously-deployed actor already
  /// used the current types (User without avatar, AppliedRole with
  /// #Developer), so no per-record transformation is needed. The migration
  /// exists only to explicitly reconstruct the `state` record (which the
  /// stable checker treats as its own stable variable due to its `var`
  /// field) from `old.state` with the new types.
  public func run(old : OldActor) : NewActor {
    let stateUsers = old.state.users;
    let stateApplications = old.state.applications;
    {
      users = old.users;
      applications = old.applications;
      var nextApplicationId = old.nextApplicationId;
      state = {
        users = stateUsers;
        applications = stateApplications;
        var nextApplicationId = old.state.nextApplicationId;
      };
      messages = old.messages;
      var nextMessageId = old.nextMessageId;
      posts = old.posts;
      communityVotes = old.communityVotes;
      comments = old.comments;
      dailyCounts = old.dailyCounts;
      var nextPostId = old.nextPostId;
      var nextCommentId = old.nextCommentId;
      roster = old.roster;
      rankSlots = old.rankSlots;
      var nextRosterMemberId = old.nextRosterMemberId;
    };
  };
};
