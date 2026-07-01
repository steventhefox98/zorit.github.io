import Messaging "../lib/messaging";
import AuthRolesApplications "../lib/auth-roles-applications";
import StaffRosterApplications "../lib/staff-roster-and-applications";
import Types "../types/messaging";

mixin (state : Messaging.State, authState : AuthRolesApplications.State, rosterState : StaffRosterApplications.State) {
  /// Send a direct message from one staff user to another. Verifies the
  /// sender's role is Administrator or CoAdministrator before storing.
  /// Returns { success = false; messageId = null } on failure.
  public shared ({ caller }) func sendStaffMessage(senderUsername : Text, recipientUsername : Text, content : Text) : async Types.SendMessageResult {
    ignore caller;
    Messaging.sendStaffMessage(state, authState, senderUsername, recipientUsername, content);
  };

  /// Return all messages between the requester and the peer, ordered by
  /// timestamp ascending. Role-gated to Administrator or CoAdministrator.
  public query func getStaffConversation(requesterUsername : Text, peerUsername : Text) : async [Types.Message] {
    Messaging.getStaffConversation(state, authState, requesterUsername, peerUsername);
  };

  /// Return all accepted staff — every user whose role is a roster rank,
  /// #Administrator, or #CoAdministrator — for the recipient sidebar list,
  /// excluding the requester's own entry so they cannot select themselves as
  /// a peer. Each entry carries the member's access tier (role) and, when the
  /// member is on the roster, their roster rank so the frontend can display
  /// the rank label alongside the username.
  public query func getStaffDirectory(requesterUsername : Text) : async [Types.StaffDirectoryEntry] {
    Messaging.getStaffDirectory(authState, rosterState, requesterUsername);
  };
};
