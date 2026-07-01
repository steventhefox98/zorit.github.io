import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Types "../types/community";
import AuthTypes "../types/auth-roles-applications";
import Common "../types/common";

module {
  /// Community state slice. `posts` is keyed by PostId; `votes` is keyed by
  /// (PostId, normalized voter username); `comments` is keyed by CommentId;
  /// `dailyCounts` is keyed by (UTC date, postType, normalized author) to
  /// enforce the 5-posts-per-day-per-category cap. `nextPostId` and
  /// `nextCommentId` are monotonic counters wrapped in a record so `var`
  /// mutations propagate to mixins.
  public type State = {
    posts : Map.Map<Types.PostId, Types.Post>;
    votes : Map.Map<VoteKey, Types.Vote>;
    comments : Map.Map<Types.CommentId, Types.Comment>;
    dailyCounts : Map.Map<DailyCountKey, Nat>;
    var nextPostId : Types.PostId;
    var nextCommentId : Types.CommentId;
  };

  /// Composite key for a vote: post id + normalized voter username.
  public type VoteKey = (Types.PostId, Common.Username);

  /// Composite key for the daily cap: UTC date (YYYY-MM-DD) + post type +
  /// normalized author username.
  public type DailyCountKey = (Text, Types.PostType, Common.Username);

  /// Shape of the auth state slice required for role lookups. Mirrors the
  /// existing AuthRolesApplications.State.users field.
  public type AuthState = {
    users : Map.Map<Common.Username, AuthTypes.User>;
  };

  /// True when the role is Administrator or CoAdministrator — the exact
  /// predicate used to gate staff-only voting and commenting. Roster rank
  /// constructors are not staff for community gating purposes.
  public func isStaffRole(role : AuthTypes.Role) : Bool {
    switch (role) {
      case (#Administrator or #CoAdministrator) true;
      case _ false;
    };
  };

  /// Compare two PostType variants for ordering (used by DailyCountKey compare).
  func comparePostType(a : Types.PostType, b : Types.PostType) : Order.Order {
    switch (a, b) {
      case (#bugReport, #bugReport) #equal;
      case (#bugReport, _) #less;
      case (_, #bugReport) #greater;
      case (#suggestion, #suggestion) #equal;
      case (#suggestion, _) #less;
      case (_, #suggestion) #greater;
      case (#eventSuggestion, #eventSuggestion) #equal;
    };
  };

  /// Explicit compare for VoteKey = (PostId, Username). Tuples do not
  /// auto-derive compare, so the Map module requires it explicitly.
  public func compareVoteKey(a : VoteKey, b : VoteKey) : Order.Order {
    let (aPost, aUser) = a;
    let (bPost, bUser) = b;
    switch (Nat.compare(aPost, bPost)) {
      case (#equal) Text.compare(aUser, bUser);
      case order order;
    };
  };

  /// Explicit compare for DailyCountKey = (date, postType, username). Tuples
  /// and the PostType variant do not auto-derive compare.
  public func compareDailyCountKey(a : DailyCountKey, b : DailyCountKey) : Order.Order {
    let (aDate, aType, aUser) = a;
    let (bDate, bType, bUser) = b;
    switch (Text.compare(aDate, bDate)) {
      case (#equal) {
        switch (comparePostType(aType, bType)) {
          case (#equal) Text.compare(aUser, bUser);
          case order order;
        };
      };
      case order order;
    };
  };

  /// Create a new community post. Rejects if the author has already created 5
  /// posts of the given type in the current UTC day. Returns the new post id
  /// on success.
  public func createPost(state : State, _authState : AuthState, postType : Types.PostType, title : Text, body : Text, authorUsername : Common.Username) : Types.CreatePostResult {
    let authorNormalized = toLower(authorUsername);
    let date = utcDateKey(Time.now());
    let dailyKey : DailyCountKey = (date, postType, authorNormalized);
    let currentCount = switch (state.dailyCounts.get(compareDailyCountKey, dailyKey)) {
      case (?c) c;
      case null 0;
    };
    if (currentCount >= 5) {
      return { success = false; postId = null };
    };
    state.dailyCounts.add(compareDailyCountKey, dailyKey, currentCount + 1);
    let id = state.nextPostId;
    let post : Types.Post = {
      id;
      postType;
      title;
      body;
      authorUsername;
      createdAt = Time.now();
    };
    state.posts.add(id, post);
    state.nextPostId := id + 1;
    { success = true; postId = ?id };
  };

  /// Return all posts of the given type created within the last 5 days,
  /// excluding older (archived/hidden) posts so other players get submission
  /// slots. Ordered by createdAt descending.
  public func listActivePosts(state : State, postType : Types.PostType) : [Types.Post] {
    let now = Time.now();
    let cutoff = now - 432_000_000_000_000; // 5 days in nanoseconds
    let all = state.posts.toArray().map(
      func((_id, post)) { post }
    );
    let active = all.filter(
      func(post) {
        post.postType == postType and post.createdAt >= cutoff;
      }
    );
    active.sort(func(a, b) {
      Int.compare(b.createdAt, a.createdAt);
    });
  };

  /// Cast or change a staff member's vote on a post. One vote per staff member
  /// per post. Returns { success = false } if the voter is not staff or the
  /// post does not exist.
  public func voteOnPost(state : State, authState : AuthState, postId : Types.PostId, voterUsername : Common.Username, status : Types.VoteStatus) : Types.VoteResult {
    let voterNormalized = toLower(voterUsername);
    let voter = switch (authState.users.get(voterNormalized)) {
      case null return { success = false };
      case (?u) u;
    };
    if (not isStaffRole(voter.role)) {
      return { success = false };
    };
    let _post = switch (state.posts.get(postId)) {
      case null return { success = false };
      case (?p) p;
    };
    let voteKey : VoteKey = (postId, voterNormalized);
    let vote : Types.Vote = {
      postId;
      voterUsername;
      status;
      timestamp = Time.now();
    };
    state.votes.add(compareVoteKey, voteKey, vote);
    { success = true };
  };

  /// Return the approved and rejected vote counts for a single post.
  public func getVoteTally(state : State, postId : Types.PostId) : Types.VoteTally {
    var approved : Nat = 0;
    var rejected : Nat = 0;
    for ((key, vote) in state.votes.entries()) {
      if (vote.postId == postId) {
        switch (vote.status) {
          case (#approved) approved += 1;
          case (#rejected) rejected += 1;
        };
      };
    };
    { postId; approved; rejected };
  };

  /// Add a comment to a post. Rejects if the author is not staff
  /// (Administrator/CoAdministrator) AND not the original post submitter.
  /// Returns the new comment id on success.
  public func addComment(state : State, authState : AuthState, postId : Types.PostId, authorUsername : Common.Username, content : Text) : Types.AddCommentResult {
    let post = switch (state.posts.get(postId)) {
      case null return { success = false; commentId = null };
      case (?p) p;
    };
    let authorNormalized = toLower(authorUsername);
    let isSubmitter = toLower(post.authorUsername) == authorNormalized;
    let isStaff = switch (authState.users.get(authorNormalized)) {
      case null false;
      case (?user) isStaffRole(user.role);
    };
    if (not (isStaff or isSubmitter)) {
      return { success = false; commentId = null };
    };
    let id = state.nextCommentId;
    let comment : Types.Comment = {
      id;
      postId;
      authorUsername;
      content;
      timestamp = Time.now();
    };
    state.comments.add(id, comment);
    state.nextCommentId := id + 1;
    { success = true; commentId = ?id };
  };

  /// Return all comments for the given post id in chronological order
  /// (timestamp ascending).
  public func listComments(state : State, postId : Types.PostId) : [Types.Comment] {
    let all = state.comments.toArray().map(
      func((_id, comment)) { comment }
    );
    let matched = all.filter(
      func(comment) { comment.postId == postId }
    );
    matched.sort(func(a, b) {
      Int.compare(a.timestamp, b.timestamp);
    });
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

  /// Build a UTC date key (YYYY-MM-DD) from a nanosecond timestamp.
  /// Uses integer division on the epoch to avoid timezone libraries.
  func utcDateKey(timestamp : Int) : Text {
    let daysSinceEpoch = timestamp / 86_400_000_000_000;
    let (year, month, day) = daysToYmd(daysSinceEpoch);
    year.toText() # "-" # pad2(month) # "-" # pad2(day);
  };

  /// Convert a day count since the Unix epoch (1970-01-01) to a (year, month, day)
  /// triple using the proleptic Gregorian calendar. Algorithm: Howard Hinnant's
  /// days_from_civil inverse.
  func daysToYmd(days : Int) : (Int, Int, Int) {
    let z = days + 719_468;
    let era = if (z >= 0) { z / 146_097 } else { (z - 146_096) / 146_097 };
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if (mp < 10) { mp + 3 } else { mp - 9 };
    let year = if (m <= 2) { y + 1 } else { y };
    (year, m, d);
  };

  /// Zero-pad a positive month/day value to two digits.
  func pad2(n : Int) : Text {
    if (n < 10) { "0" # n.toText() } else { n.toText() };
  };
};
