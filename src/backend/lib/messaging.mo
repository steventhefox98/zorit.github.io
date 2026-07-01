import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Types "../types/messaging";
import AuthTypes "../types/auth-roles-applications";
import StaffRosterTypes "../types/staff-roster-and-applications";
import Common "../types/common";

module {
  /// Messaging state slice. `messages` is keyed by MessageId; `nextMessageId`
  /// is a monotonic counter wrapped in a record so `var` mutations propagate
  /// to mixins.
  public type State = {
    messages : Map.Map<Common.MessageId, Types.Message>;
    var nextMessageId : Common.MessageId;
  };

  /// Shape of the auth state slice required for role lookups. Mirrors the
  /// existing AuthRolesApplications.State.users field.
  public type AuthState = {
    users : Map.Map<Common.Username, AuthTypes.User>;
  };

  /// Shape of the roster state slice required to look up each staff user's
  /// roster rank for the staff directory. Mirrors the roster field of
  /// StaffRosterApplications.State.
  public type RosterState = {
    roster : Map.Map<StaffRosterTypes.RosterMemberId, StaffRosterTypes.RosterMember>;
  };

  /// True when the role grants staff messaging access — Administrator,
  /// CoAdministrator, and every roster-rank Role. Accepted applicants are
  /// promoted to #Administrator or #CoAdministrator via rankToAccessRole, so
  /// they satisfy this predicate; the roster-rank constructors are also
  /// accepted directly so any user carrying a roster rank (e.g. from a prior
  /// acceptance or direct assignment) can send and read staff DMs.
  public func isStaffRole(role : AuthTypes.Role) : Bool {
    switch (role) {
      case (#Administrator or #CoAdministrator) true;
      case (#Owner or #CoOwner or #Manager or #AdvertiseManager or #ChiefAdmin or #SrDeveloper or #Developer or #Admin or #JrAdmin or #Mod or #Cop or #Builder or #SrCop) true;
      case (#Member) false;
    };
  };

  /// Store a new message after verifying the sender's role is staff.
  /// Returns { success = false; messageId = null } if the sender is not staff,
  /// does not exist, the content is empty, or the sender equals the recipient
  /// (case-insensitive — self-messages are rejected).
  public func sendStaffMessage(state : State, authState : AuthState, senderUsername : Common.Username, recipientUsername : Common.Username, content : Text) : Types.SendMessageResult {
    if (content.isEmpty()) {
      return { success = false; messageId = null };
    };
    let senderNormalized = toLower(senderUsername);
    let recipientNormalized = toLower(recipientUsername);
    if (senderNormalized == recipientNormalized) {
      return { success = false; messageId = null };
    };
    switch (authState.users.get(senderNormalized)) {
      case null {
        { success = false; messageId = null };
      };
      case (?sender) {
        if (not isStaffRole(sender.role)) {
          { success = false; messageId = null };
        } else {
          let id = state.nextMessageId;
          let message : Types.Message = {
            id;
            senderUsername;
            recipientUsername;
            content;
            timestamp = Time.now();
          };
          state.messages.add(id, message);
          state.nextMessageId := id + 1;
          { success = true; messageId = ?id };
        };
      };
    };
  };

  /// Return all messages between the two staff users, ordered by timestamp
  /// ascending. Role-gated: returns an empty array if the requester is not
  /// staff or does not exist. Returns an empty array when the requester equals
  /// the peer (case-insensitive) so prior self-message threads are hidden.
  public func getStaffConversation(state : State, authState : AuthState, requesterUsername : Common.Username, peerUsername : Common.Username) : [Types.Message] {
    let requesterNormalized = toLower(requesterUsername);
    let peerNormalized = toLower(peerUsername);
    if (requesterNormalized == peerNormalized) {
      return [];
    };
    switch (authState.users.get(requesterNormalized)) {
      case null { [] };
      case (?requester) {
        if (not isStaffRole(requester.role)) {
          [];
        } else {
          let all = state.messages.toArray().map(
            func((_id, msg)) { msg }
          );
          let matched = all.filter(
            func(msg) {
              let s = toLower(msg.senderUsername);
              let r = toLower(msg.recipientUsername);
              (s == requesterNormalized and r == peerNormalized) or
              (s == peerNormalized and r == requesterNormalized);
            }
          );
          matched.sort(func(a, b) {
            Int.compare(a.timestamp, b.timestamp);
          });
        };
      };
    };
  };

  /// Return all accepted staff — every user whose role is a roster rank,
  /// #Administrator, or #CoAdministrator — for the recipient sidebar list,
  /// excluding the requester's own entry so they cannot select themselves as
  /// a peer. Each entry carries the member's full Role (access tier) and,
  /// when the member is on the roster, their roster rank so the frontend can
  /// display the rank label alongside the username. The roster is keyed by
  /// RosterMemberId and members store their display name in `name` (set to
  /// the applicant's username by acceptApplication), so we build a
  /// case-insensitive username -> RosterRank lookup from the roster once
  /// and join it against the staff users.
  public func getStaffDirectory(authState : AuthState, rosterState : RosterState, requesterUsername : Common.Username) : [Types.StaffDirectoryEntry] {
    let requesterNormalized = toLower(requesterUsername);
    // Build a case-insensitive username -> RosterRank index from the roster
    // so each staff user can be matched to their rank in one pass.
    let rankByUsername = Map.empty<Common.Username, AuthTypes.RosterRank>();
    for ((_id, member) in rosterState.roster.entries()) {
      rankByUsername.add(toLower(member.name), member.rank);
    };

    let all = authState.users.toArray().map(
      func((_username, user)) { user }
    );
    let staff = all.filter(
      func(user) {
        isStaffRole(user.role) and toLower(user.username) != requesterNormalized;
      }
    );
    staff.map(
      func(user) {
        let rank = rankByUsername.get(toLower(user.username));
        { username = user.username; role = user.role; rank };
      }
    );
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
