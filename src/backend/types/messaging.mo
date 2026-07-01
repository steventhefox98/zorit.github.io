import Common "common";
import AuthTypes "auth-roles-applications";

module {
  /// A single direct message between two staff users. `senderUsername` and
  /// `recipientUsername` are stored as given (case-insensitive matching is
  /// applied at lookup time). `timestamp` is nanoseconds since epoch.
  public type Message = {
    id : Common.MessageId;
    senderUsername : Common.Username;
    recipientUsername : Common.Username;
    content : Text;
    timestamp : Common.Timestamp;
  };

  /// Return shape of sendStaffMessage — messageId is null on failure
  /// (e.g. sender is not staff).
  public type SendMessageResult = {
    success : Bool;
    messageId : ?Common.MessageId;
  };

  /// A staff directory entry for the recipient sidebar list. `role` carries
  /// the member's access tier (#Administrator or #CoAdministrator for accepted
  /// staff). `rank` carries the member's roster rank when they have been added
  /// to the roster (e.g. via acceptApplication), so the frontend can display
  /// the rank label alongside the username. `rank` is null for staff who are
  /// not on the roster (e.g. seed Administrators without a roster entry).
  public type StaffDirectoryEntry = {
    username : Common.Username;
    role : AuthTypes.Role;
    rank : ?AuthTypes.RosterRank;
  };
};
