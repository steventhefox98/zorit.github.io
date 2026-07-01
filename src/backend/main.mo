import Map "mo:core/Map";

import Common "types/common";
import AuthRolesApplicationsTypes "types/auth-roles-applications";
import MessagingTypes "types/messaging";
import CommunityTypes "types/community";
import StaffRosterApplicationsTypes "types/staff-roster-and-applications";
import AuthRolesApplicationsLib "lib/auth-roles-applications";
import MessagingLib "lib/messaging";
import CommunityLib "lib/community";
import StaffRosterApplicationsLib "lib/staff-roster-and-applications";
import AuthRolesApplicationsApi "mixins/auth-roles-applications-api";
import MessagingApi "mixins/messaging-api";
import CommunityApi "mixins/community-api";
import StaffRosterApplicationsApi "mixins/staff-roster-and-applications-api";
import UserManagementApi "mixins/user-management-api";



actor {
  /// users : Username -> User (persisted across upgrades via enhanced
  /// orthogonal persistence). The User record no longer carries an `avatar`
  /// field — the avatar feature was removed; the upgrade migration drops any
  /// previously-stored avatar value from each user record.
  let users = Map.empty<Common.Username, AuthRolesApplicationsTypes.User>();

  /// applications : ApplicationId -> Application (persisted across upgrades).
  let applications = Map.empty<Common.ApplicationId, AuthRolesApplicationsTypes.Application>();

  /// Monotonic counter for new application ids.
  var nextApplicationId : Common.ApplicationId = 0;

  /// messages : MessageId -> Message (persisted across upgrades).
  let messages = Map.empty<Common.MessageId, MessagingTypes.Message>();

  /// Monotonic counter for new message ids.
  var nextMessageId : Common.MessageId = 0;

  /// Auth/applications state record shared with mixins — wrapped so `var`
  /// mutations propagate.
  let state : AuthRolesApplicationsLib.State = {
    users;
    applications;
    var nextApplicationId;
  };

  /// Messaging state record shared with the messaging mixin. `users` is
  /// shared with the auth state for role lookups.
  let messagingState : MessagingLib.State = {
    messages;
    var nextMessageId;
  };

  /// Community posts : PostId -> Post (persisted across upgrades).
  let posts = Map.empty<CommunityTypes.PostId, CommunityTypes.Post>();

  /// Community votes : (PostId, normalized voter username) -> Vote
  /// (persisted across upgrades).
  let communityVotes = Map.empty<CommunityLib.VoteKey, CommunityTypes.Vote>();

  /// Community comments : CommentId -> Comment (persisted across upgrades).
  let comments = Map.empty<CommunityTypes.CommentId, CommunityTypes.Comment>();

  /// Daily cap counters : (UTC date, postType, normalized author) -> count
  /// (persisted across upgrades).
  let dailyCounts = Map.empty<CommunityLib.DailyCountKey, Nat>();

  /// Monotonic counter for new post ids.
  var nextPostId : CommunityTypes.PostId = 0;

  /// Monotonic counter for new comment ids.
  var nextCommentId : CommunityTypes.CommentId = 0;

  /// Community state record shared with the community mixin. `users` is
  /// shared with the auth state for role lookups (staff gating for votes and
  /// comments).
  let communityState : CommunityLib.State = {
    posts;
    votes = communityVotes;
    comments;
    dailyCounts;
    var nextPostId;
    var nextCommentId;
  };

  /// Staff roster : RosterMemberId -> RosterMember (persisted across
  /// upgrades). Stores the Team page roster so edits survive reloads and are
  /// visible to all users.
  let roster = Map.empty<StaffRosterApplicationsTypes.RosterMemberId, StaffRosterApplicationsTypes.RosterMember>();

  /// Rank slot counts : RosterRank -> max members (persisted across
  /// upgrades). One integer per rank; admins can edit these via setRankSlot.
  /// Initialized to defaults by the migration on upgrade (or by the first
  /// getRankSlots call on fresh install).
  let rankSlots = Map.empty<AuthRolesApplicationsTypes.RosterRank, Nat>();

  /// Monotonic counter for new roster member ids.
  var nextRosterMemberId : StaffRosterApplicationsTypes.RosterMemberId = 0;

  /// Staff roster + two-step accept + editable rank slots state record
  /// shared with the roster mixin. `users` and `applications` are shared
  /// with the auth state so acceptApplication can promote the applicant's
  /// user role and admin gating can check the caller's current role.
  let staffRosterState : StaffRosterApplicationsLib.State = {
    roster;
    rankSlots;
    var nextRosterMemberId;
  };

  include AuthRolesApplicationsApi(state);
  include MessagingApi(messagingState, state, staffRosterState);
  include CommunityApi(communityState, state);
  include StaffRosterApplicationsApi(staffRosterState, state);
  include UserManagementApi(state, staffRosterState);
};
