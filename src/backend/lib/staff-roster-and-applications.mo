import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Types "../types/staff-roster-and-applications";
import AuthTypes "../types/auth-roles-applications";
import Common "../types/common";

module {
  /// Staff roster + two-step accept + editable rank slots state slice.
  public type State = {
    roster : Map.Map<Types.RosterMemberId, Types.RosterMember>;
    rankSlots : Map.Map<AuthTypes.RosterRank, Nat>;
    var nextRosterMemberId : Types.RosterMemberId;
  };

  /// Shape of the auth state slice required for role lookups and user
  /// promotion.
  public type AuthState = {
    users : Map.Map<Common.Username, AuthTypes.User>;
    applications : Map.Map<Common.ApplicationId, AuthTypes.Application>;
  };

  /// True when the role grants admin editing rights on the roster, the
  /// two-step accept, and rank slot editing (Administrator only).
  public func isAdminRole(role : AuthTypes.Role) : Bool {
    role == #Administrator;
  };

  /// True when the role is permitted to view applications (Administrator
  /// and CoAdministrator).
  public func canReviewApplications(role : AuthTypes.Role) : Bool {
    switch (role) {
      case (#Administrator or #CoAdministrator) true;
      case _ false;
    };
  };

  /// Map a RosterRank to the access Role the applicant is promoted to when
  /// their application is accepted. The #Developer and #SrDeveloper roster
  /// ranks map to #CoAdministrator (matching how #Admin, #JrAdmin, #Mod,
  /// #Cop, and #Builder are handled — the CoAdministrator tier), so accepted
  /// Developer applicants gain staff messaging access.
  public func rankToAccessRole(rank : AuthTypes.RosterRank) : AuthTypes.Role {
    switch (rank) {
      case (#Owner or #CoOwner or #Manager or #AdvertiseManager or #ChiefAdmin) #CoAdministrator;
      case (#SrDeveloper or #Developer) #CoAdministrator;
      case (#Admin or #JrAdmin or #Mod or #Cop or #Builder or #SrCop) #CoAdministrator;
    };
  };

  /// Canonical ordering of roster ranks for getRoster output.
  public func rankOrder(rank : AuthTypes.RosterRank) : Nat {
    switch (rank) {
      case (#Owner) 0;
      case (#CoOwner) 1;
      case (#Manager) 2;
      case (#AdvertiseManager) 3;
      case (#ChiefAdmin) 4;
      case (#SrDeveloper) 5;
      case (#Developer) 6;
      case (#Admin) 7;
      case (#JrAdmin) 8;
      case (#Mod) 9;
      case (#Cop) 10;
      case (#Builder) 11;
      case (#SrCop) 12;
    };
  };

  /// Compare two RosterRank values by canonical order.
  public func compareRank(a : AuthTypes.RosterRank, b : AuthTypes.RosterRank) : Order.Order {
    Nat.compare(rankOrder(a), rankOrder(b));
  };

  /// The seed roster used when the backend roster is empty.
  public func seedRoster() : [Types.RosterMember] {
    [
      { id = 0; name = "Steven"; rank = #Owner },
      { id = 1; name = "Qbhinoor"; rank = #CoOwner },
      { id = 2; name = "Alex"; rank = #Manager },
      { id = 3; name = "Jordan"; rank = #AdvertiseManager },
      { id = 4; name = "Casey"; rank = #ChiefAdmin },
      { id = 5; name = "Riley"; rank = #SrDeveloper },
      { id = 6; name = "Taylor"; rank = #Developer },
      { id = 7; name = "Morgan"; rank = #Admin },
      { id = 8; name = "Sam"; rank = #JrAdmin },
      { id = 9; name = "Jamie"; rank = #Mod },
      { id = 10; name = "Drew"; rank = #Cop },
      { id = 11; name = "Reese"; rank = #Builder },
      { id = 12; name = "Quinn"; rank = #SrCop },
    ];
  };

  /// Default slot counts (max members) per rank.
  public func defaultRankSlots() : [Types.RankSlot] {
    [
      { rank = #Owner; slots = 1 },
      { rank = #CoOwner; slots = 1 },
      { rank = #Manager; slots = 2 },
      { rank = #AdvertiseManager; slots = 2 },
      { rank = #ChiefAdmin; slots = 2 },
      { rank = #SrDeveloper; slots = 3 },
      { rank = #Developer; slots = 5 },
      { rank = #Admin; slots = 5 },
      { rank = #JrAdmin; slots = 5 },
      { rank = #Mod; slots = 8 },
      { rank = #Cop; slots = 8 },
      { rank = #Builder; slots = 8 },
      { rank = #SrCop; slots = 8 },
    ];
  };

  /// Return the full roster grouped by rank, ordered by canonical rank
  /// order. Falls back to seed defaults when the backend roster is empty so
  /// the Team page can render on first load.
  public func getRoster(state : State) : [Types.RosterGroup] {
    let members = if (state.roster.size() == 0) {
      seedRoster();
    } else {
      state.roster.toArray().map(
        func((_id, member)) { member }
      );
    };
    let allRanks : [AuthTypes.RosterRank] = [
      #Owner, #CoOwner, #Manager, #AdvertiseManager, #ChiefAdmin,
      #SrDeveloper, #Developer, #Admin, #JrAdmin, #Mod, #Cop, #Builder, #SrCop,
    ];
    allRanks.map(
      func(rank) {
        let groupMembers = members.filter(
          func(member) { member.rank == rank }
        );
        { rank; members = groupMembers };
      }
    );
  };

  /// Return all rank slot counts (max members per rank), ordered by the
  /// canonical rank order. Initializes missing ranks to their defaults on
  /// first read so admins see sensible capacity values.
  public func getRankSlots(state : State) : [Types.RankSlot] {
    let defaults = defaultRankSlots();
    defaults.map(
      func(slot) {
        let current = switch (state.rankSlots.get(compareRank, slot.rank)) {
          case (?n) n;
          case null {
            state.rankSlots.add(compareRank, slot.rank, slot.slots);
            slot.slots;
          };
        };
        { rank = slot.rank; slots = current };
      }
    );
  };

  /// Set a single rank's slot count (max members). Administrator-only.
  public func setRankSlot(state : State, authState : AuthState, callerUsername : Common.Username, rank : AuthTypes.RosterRank, slots : Nat) : Types.SetRankSlotResult {
    switch (lookupRole(authState, callerUsername)) {
      case null { { success = false } };
      case (?role) {
        if (not isAdminRole(role)) {
          { success = false };
        } else {
          state.rankSlots.add(compareRank, rank, slots);
          { success = true };
        };
      };
    };
  };

  /// Look up a user's current role by username (case-insensitive).
  public func lookupRole(authState : AuthState, username : Common.Username) : ?AuthTypes.Role {
    let normalized = toLower(username);
    switch (authState.users.get(normalized)) {
      case null null;
      case (?user) ?user.role;
    };
  };

  /// Add a new member to the roster under the given rank. Administrator-only.
  public func addStaffRosterMember(state : State, authState : AuthState, callerUsername : Common.Username, name : Text, rank : AuthTypes.RosterRank) : Types.AddRosterMemberResult {
    switch (lookupRole(authState, callerUsername)) {
      case null { { success = false; memberId = null } };
      case (?role) {
        if (not isAdminRole(role)) {
          { success = false; memberId = null };
        } else {
          let id = state.nextRosterMemberId;
          let member : Types.RosterMember = { id; name; rank };
          state.roster.add(id, member);
          state.nextRosterMemberId := id + 1;
          { success = true; memberId = ?id };
        };
      };
    };
  };

  /// Remove a member from the roster by id. Administrator-only.
  public func removeStaffRosterMember(state : State, authState : AuthState, callerUsername : Common.Username, memberId : Types.RosterMemberId) : Types.RemoveRosterMemberResult {
    switch (lookupRole(authState, callerUsername)) {
      case null { { success = false } };
      case (?role) {
        if (not isAdminRole(role)) {
          { success = false };
        } else {
          switch (state.roster.get(memberId)) {
            case null { { success = false } };
            case (?_member) {
              state.roster.remove(memberId);
              { success = true };
            };
          };
        };
      };
    };
  };

  /// Two-step accept: mark the application Accepted, promote the
  /// applicant's user role to the access tier for the chosen rank, AND add
  /// the applicant to the roster under the assigned rank. Administrator-only.
  /// For a Developer application, the caller passes #Developer as the
  /// assignedRank; rankToAccessRole maps it to #CoAdministrator.
  public func acceptApplication(state : State, authState : AuthState, callerUsername : Common.Username, applicationId : Common.ApplicationId, assignedRank : AuthTypes.RosterRank) : Types.AcceptApplicationResult {
    // Admin gate — strict === #Administrator (Co-Administrators are view-only
    // for the accept step).
    switch (lookupRole(authState, callerUsername)) {
      case null { return { success = false } };
      case (?role) {
        if (not isAdminRole(role)) {
          return { success = false };
        };
      };
    };
    // Look up the application; reject if missing or not Pending.
    let application = switch (authState.applications.get(applicationId)) {
      case null { return { success = false } };
      case (?app) app;
    };
    switch (application.status) {
      case (#Pending) {};
      case _ { return { success = false } };
    };
    // Mark the application Accepted.
    authState.applications.add(applicationId, { application with status = #Accepted });
    // Promote the applicant's user role to the access tier for the rank.
    let normalized = toLower(application.applicantUsername);
    switch (authState.users.get(normalized)) {
      case null {};
      case (?user) {
        authState.users.add(normalized, { user with role = rankToAccessRole(assignedRank) });
      };
    };
    // Add the applicant to the roster under the assigned rank (if not
    // already present, case-insensitive name match).
    let alreadyOnRoster = state.roster.toArray().any(
      func((_id, member)) : Bool { toLower(member.name) == normalized }
    );
    if (not alreadyOnRoster) {
      let id = state.nextRosterMemberId;
      let member : Types.RosterMember = {
        id;
        name = application.applicantUsername;
        rank = assignedRank;
      };
      state.roster.add(id, member);
      state.nextRosterMemberId := id + 1;
    };
    { success = true };
  };

  /// Decline an application (single-step). Returns false if the
  /// application id does not exist.
  public func declineApplication(authState : AuthState, applicationId : Common.ApplicationId) : Bool {
    switch (authState.applications.get(applicationId)) {
      case null false;
      case (?application) {
        authState.applications.add(applicationId, { application with status = #Declined });
        true;
      };
    };
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
};
