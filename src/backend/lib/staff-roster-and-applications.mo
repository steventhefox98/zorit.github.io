import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Types "../types/staff-roster-and-applications";
import AuthTypes "../types/auth-roles-applications";
import Common "../types/common";

module {
  /// Staff roster + two-step accept + editable rank slots state slice.
  /// `roster` is keyed by RosterMemberId; `nextRosterMemberId` is a
  /// monotonic counter wrapped in a record so `var` mutations propagate to
  /// mixins. `rankSlots` stores the editable max-members count per
  /// RosterRank (one integer per rank). The auth state slice (`users`) is
  /// shared so acceptApplication can promote the applicant's user role, and
  /// so admin gating can check the caller's current role.
  public type State = {
    roster : Map.Map<Types.RosterMemberId, Types.RosterMember>;
    rankSlots : Map.Map<AuthTypes.RosterRank, Nat>;
    var nextRosterMemberId : Types.RosterMemberId;
  };

  /// Shape of the auth state slice required for role lookups and user
  /// promotion. Mirrors AuthRolesApplications.State.users and
  /// AuthRolesApplications.State.applications.
  public type AuthState = {
    users : Map.Map<Common.Username, AuthTypes.User>;
    applications : Map.Map<Common.ApplicationId, AuthTypes.Application>;
  };

  /// True when the role grants admin editing rights on the roster, the
  /// two-step accept, and rank slot editing (Administrator only).
  /// Co-Administrators are view-only for these operations.
  public func isAdminRole(role : AuthTypes.Role) : Bool {
    role == #Administrator;
  };

  /// True when the role is permitted to view applications (Administrator
  /// and CoAdministrator).
  public func canReviewApplications(role : AuthTypes.Role) : Bool {
    role == #Administrator or role == #CoAdministrator;
  };

  /// Map a RosterRank to the access Role the applicant is promoted to when
  /// their application is accepted. The top tier of ranks (#Owner, #CoOwner,
  /// #Manager, #ChiefAdmin, #SrCop, #Cop) map to #Administrator; every other
  /// rank maps to #CoAdministrator. Both access tiers satisfy isStaffRole, so
  /// accepted staff gain messaging access regardless of their assigned rank.
  /// The assigned roster rank is still recorded on the roster member (via
  /// addStaffRosterMember) so the Team page shows the correct rank label.
  public func rankToAccessRole(rank : AuthTypes.RosterRank) : AuthTypes.Role {
    switch (rank) {
      // Top tier -> Administrator access.
      case (#Owner) #Administrator;
      case (#CoOwner) #Administrator;
      case (#Manager) #Administrator;
      case (#ChiefAdmin) #Administrator;
      case (#SrCop) #Administrator;
      case (#Cop) #Administrator;
      // Remaining ranks -> CoAdministrator access.
      case (#AdvertiseManager) #CoAdministrator;
      case (#SrDeveloper) #CoAdministrator;
      case (#Developer) #CoAdministrator;
      case (#Admin) #CoAdministrator;
      case (#JrAdmin) #CoAdministrator;
      case (#Mod) #CoAdministrator;
      case (#Builder) #CoAdministrator;
    };
  };

  /// Canonical ordering of roster ranks for getRoster output. Lower index
  /// = higher rank. Matches the order of the role groups on the Team page.
  /// The duplicate Sr-Admin variants have been removed; #Cop and #SrCop are
  /// positioned immediately after #Mod, with #Builder last.
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
      case (#SrCop) 11;
      case (#Builder) 12;
    };
  };

  /// Compare two RosterRank values by canonical order.
  public func compareRank(a : AuthTypes.RosterRank, b : AuthTypes.RosterRank) : Order.Order {
    let oa = rankOrder(a);
    let ob = rankOrder(b);
    if (oa < ob) { #less } else if (oa > ob) { #greater } else { #equal };
  };

  /// The seed roster used when the backend roster is empty so the Team page
  /// has content on first load. Mirrors the hardcoded frontend roster. The
  /// duplicate Sr-Admin entries have been removed; the previously
  /// #SrAdminRank seed member is reassigned to #Admin.
  public func seedRoster() : [Types.RosterMember] {
    [
      { id = 0; name = "Steven"; rank = #Owner },
      { id = 1; name = "Qbhinoor"; rank = #CoOwner },
      { id = 2; name = "Alex"; rank = #Manager },
      { id = 3; name = "Jordan"; rank = #AdvertiseManager },
      { id = 4; name = "Casey"; rank = #ChiefAdmin },
      { id = 5; name = "Riley"; rank = #SrDeveloper },
      { id = 6; name = "Sam"; rank = #Developer },
      { id = 7; name = "Taylor"; rank = #Admin },
      { id = 8; name = "Morgan"; rank = #JrAdmin },
      { id = 9; name = "Jamie"; rank = #Mod },
      { id = 10; name = "Drew"; rank = #Cop },
      { id = 11; name = "Reese"; rank = #Builder },
      { id = 12; name = "Skyler"; rank = #SrCop },
    ];
  };

  /// Default slot counts (max members) per rank, used to initialize
  /// rankSlots on first load. Values mirror the hardcoded maxPlayers in the
  /// frontend RoleHierarchySection so the initial capacity matches the
  /// current Team page layout.
  public func defaultRankSlots() : [Types.RankSlot] {
    [
      { rank = #Owner; slots = 1 },
      { rank = #CoOwner; slots = 1 },
      { rank = #Manager; slots = 1 },
      { rank = #AdvertiseManager; slots = 1 },
      { rank = #ChiefAdmin; slots = 1 },
      { rank = #SrDeveloper; slots = 1 },
      { rank = #Developer; slots = 2 },
      { rank = #Admin; slots = 3 },
      { rank = #JrAdmin; slots = 3 },
      { rank = #Mod; slots = 5 },
      { rank = #Cop; slots = 5 },
      { rank = #Builder; slots = 3 },
      { rank = #SrCop; slots = 5 },
    ];
  };

  /// Ensure rankSlots is populated with defaults when empty (first call on
  /// fresh install). Mutates state.rankSlots in place.
  func ensureRankSlots(state : State) {
    if (state.rankSlots.size() == 0) {
      for (slot in defaultRankSlots().vals()) {
        state.rankSlots.add(compareRank, slot.rank, slot.slots);
      };
    };
  };

  /// Group a flat list of roster members by rank, ordered by canonical
  /// rank order then by member id within each group.
  public func groupByRank(members : [Types.RosterMember]) : [Types.RosterGroup] {
    // Bucket members by rank.
    let buckets = Map.empty<AuthTypes.RosterRank, [Types.RosterMember]>();
    for (member in members.vals()) {
      let existing = switch (buckets.get(compareRank, member.rank)) {
        case (?arr) arr;
        case null [];
      };
      buckets.add(compareRank, member.rank, existing.concat([member]));
    };

    // Build groups ordered by canonical rank order, each group's members
    // sorted by member id.
    let groups = Array.map(
      [
        #Owner, #CoOwner, #Manager, #AdvertiseManager, #ChiefAdmin,
        #SrDeveloper, #Developer, #Admin, #JrAdmin, #Mod, #Cop, #SrCop,
        #Builder,
      ],
      func(rank) {
        let members = switch (buckets.get(compareRank, rank)) {
          case (?arr) arr;
          case null [];
        };
        let sorted = members.sort(func(a, b) {
          if (a.id < b.id) { #less } else if (a.id > b.id) { #greater } else { #equal };
        });
        { rank; members = sorted };
      }
    );
    groups;
  };

  /// Return the full roster grouped by rank, ordered by the canonical rank
  /// order then by member id. When the roster is empty, returns the seed
  /// defaults so the Team page can fall back to the hardcoded list.
  public func getRoster(state : State) : [Types.RosterGroup] {
    if (state.roster.size() == 0) {
      groupByRank(seedRoster());
    } else {
      groupByRank(state.roster.toArray().map(func((_id, m)) { m }));
    };
  };

  /// Return all rank slot counts (max members per rank), ordered by the
  /// canonical rank order. Initializes rankSlots to defaults on first call
  /// when the map is empty.
  public func getRankSlots(state : State) : [Types.RankSlot] {
    ensureRankSlots(state);
    let order : [AuthTypes.RosterRank] = [
      #Owner, #CoOwner, #Manager, #AdvertiseManager, #ChiefAdmin,
      #SrDeveloper, #Developer, #Admin, #JrAdmin, #Mod, #Cop, #SrCop,
      #Builder,
    ];
    order.map(
      func(rank) {
        let slots = switch (state.rankSlots.get(compareRank, rank)) {
          case (?n) n;
          case null 0;
        };
        { rank; slots };
      }
    );
  };

  /// Set a single rank's slot count (max members). Caller must be an
  /// Administrator. Initializes rankSlots to defaults on first call when
  /// the map is empty. Returns false if the caller is not an Administrator.
  public func setRankSlot(state : State, authState : AuthState, callerUsername : Common.Username, rank : AuthTypes.RosterRank, slots : Nat) : Types.SetRankSlotResult {
    ensureRankSlots(state);
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

  /// Look up a user's current role by username (case-insensitive). Returns
  /// null if the user does not exist.
  public func lookupRole(authState : AuthState, username : Common.Username) : ?AuthTypes.Role {
    let normalized = toLower(username);
    switch (authState.users.get(normalized)) {
      case (?user) ?user.role;
      case null null;
    };
  };

  /// Add a new member to the roster under the given rank. Caller must be an
  /// Administrator. Returns the new member id on success.
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

  /// Remove a member from the roster by id. Caller must be an Administrator.
  public func removeStaffRosterMember(state : State, authState : AuthState, callerUsername : Common.Username, memberId : Types.RosterMemberId) : Types.RemoveRosterMemberResult {
    switch (lookupRole(authState, callerUsername)) {
      case null { { success = false } };
      case (?role) {
        if (not isAdminRole(role)) {
          { success = false };
        } else {
          switch (state.roster.get(memberId)) {
            case null { { success = false } };
            case (?_) {
              state.roster.remove(memberId);
              { success = true };
            };
          };
        };
      };
    };
  };

  /// Two-step accept: mark the application Accepted, promote the
  /// applicant's user role to the access tier for the chosen rank
  /// (Administrator for #Owner/#CoOwner/#Manager/#ChiefAdmin/#SrCop/#Cop,
  /// CoAdministrator for every other rank — see rankToAccessRole), AND add
  /// the applicant to the roster under the assigned rank so the Team page
  /// shows the newly-accepted member with the correct rank label. Caller
  /// must be an Administrator (Co-Administrators are view-only). Returns
  /// false if the application id does not exist, is not Pending, or the
  /// caller is not an Administrator. Existing accepted members retain their
  /// current access role; only new acceptances use rankToAccessRole. The
  /// roster member's `name` is set to the applicant's username so the
  /// messaging staff directory can join roster membership back to the user
  /// and display the rank label.
  public func acceptApplication(state : State, authState : AuthState, callerUsername : Common.Username, applicationId : Common.ApplicationId, assignedRank : AuthTypes.RosterRank) : Types.AcceptApplicationResult {
    switch (lookupRole(authState, callerUsername)) {
      case null { { success = false } };
      case (?role) {
        if (not isAdminRole(role)) {
          { success = false };
        } else {
          switch (authState.applications.get(applicationId)) {
            case null { { success = false } };
            case (?app) {
              if (app.status != #Pending) {
                { success = false };
              } else {
                // Mark application Accepted.
                authState.applications.add(
                  applicationId,
                  { app with status = #Accepted },
                );
                // Promote the applicant's user role to the chosen staff role.
                let normalized = toLower(app.applicantUsername);
                switch (authState.users.get(normalized)) {
                  case null { { success = false } };
                  case (?user) {
                    let newRole = rankToAccessRole(assignedRank);
                    authState.users.add(
                      normalized,
                      { user with role = newRole },
                    );
                    // Add the applicant to the roster under the assigned
                    // rank so the Team page displays them. The caller is
                    // already admin-gated above, so no re-auth is needed.
                    let memberId = state.nextRosterMemberId;
                    let member : Types.RosterMember = {
                      id = memberId;
                      name = app.applicantUsername;
                      rank = assignedRank;
                    };
                    state.roster.add(memberId, member);
                    state.nextRosterMemberId := memberId + 1;
                    { success = true };
                  };
                };
              };
            };
          };
        };
      };
    };
  };

  /// Decline an application (single-step, unchanged). Returns false if the
  /// application id does not exist.
  public func declineApplication(authState : AuthState, applicationId : Common.ApplicationId) : Bool {
    switch (authState.applications.get(applicationId)) {
      case null false;
      case (?app) {
        authState.applications.add(applicationId, { app with status = #Declined });
        true;
      };
    };
  };

  /// Lowercase a Text value (ASCII-only; sufficient for username matching).
  public func toLower(text : Text) : Text {
    text.map(func(char : Char) : Char {
      if (char >= 'A' and char <= 'Z') {
        Char.fromNat32(char.toNat32() + 32);
      } else {
        char;
      };
    });
  };
};
