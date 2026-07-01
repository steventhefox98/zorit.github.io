import Debug "mo:core/Debug";
import Community "../lib/community";
import AuthRolesApplications "../lib/auth-roles-applications";
import Types "../types/community";

mixin (state : Community.State, authState : AuthRolesApplications.State) {
  /// Create a new community post. Rejects if the author has already created 5
  /// posts of the given type in the current UTC day. Returns the new post id
  /// on success.
  public shared ({ caller }) func createCommunityPost(postType : Types.PostType, title : Text, body : Text, authorUsername : Text) : async Types.CreatePostResult {
    ignore caller;
    Community.createPost(state, authState, postType, title, body, authorUsername);
  };

  /// Return all posts of the given type created within the last 5 days,
  /// excluding older (archived/hidden) posts. Ordered by createdAt descending.
  public query func listActiveCommunityPosts(postType : Types.PostType) : async [Types.Post] {
    Community.listActivePosts(state, postType);
  };

  /// Cast or change a staff member's vote on a post. One vote per staff member
  /// per post. Returns { success = false } if the voter is not staff or the
  /// post does not exist.
  public shared ({ caller }) func voteOnCommunityPost(postId : Nat, voterUsername : Text, status : Types.VoteStatus) : async Types.VoteResult {
    ignore caller;
    Community.voteOnPost(state, authState, postId, voterUsername, status);
  };

  /// Return the approved and rejected vote counts for a single post.
  public query func getCommunityVoteTally(postId : Nat) : async Types.VoteTally {
    Community.getVoteTally(state, postId);
  };

  /// Add a comment to a post. Rejects if the author is not staff
  /// (Administrator/CoAdministrator) AND not the original post submitter.
  /// Returns the new comment id on success.
  public shared ({ caller }) func addCommunityComment(postId : Nat, authorUsername : Text, content : Text) : async Types.AddCommentResult {
    ignore caller;
    Community.addComment(state, authState, postId, authorUsername, content);
  };

  /// Return all comments for the given post id in chronological order.
  public query func listCommunityComments(postId : Nat) : async [Types.Comment] {
    Community.listComments(state, postId);
  };
};
