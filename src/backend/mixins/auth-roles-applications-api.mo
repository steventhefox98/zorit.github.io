import AuthRolesApplications "../lib/auth-roles-applications";
import Types "../types/auth-roles-applications";

mixin (state : AuthRolesApplications.State) {
  /// Register a new account. Returns { success = false; role = #Member } if
  /// the username already exists.
  public shared ({ caller }) func register(username : Text, password : Text) : async Types.RegisterResult {
    ignore caller;
    AuthRolesApplications.register(state, username, password);
  };

  /// Validate credentials and return the user's role on success.
  public shared ({ caller }) func login(username : Text, password : Text) : async Types.LoginResult {
    ignore caller;
    AuthRolesApplications.login(state, username, password);
  };

  /// Look up a user's role by username. Returns null if the user does not
  /// exist.
  public query func getMyRole(username : Text) : async ?Types.Role {
    AuthRolesApplications.getRole(state, username);
  };

  /// Submit a 12-question application. Stores it with status Pending.
  /// applicationId is null on failure. Accepts any AppliedRole (#Mod,
  /// #Admin, #Builder, #Developer).
  public shared ({ caller }) func submitApplication(username : Text, appliedRole : Types.AppliedRole, answers : [Text]) : async Types.SubmitApplicationResult {
    ignore caller;
    AuthRolesApplications.submitApplication(state, username, appliedRole, answers);
  };

  /// Return all applications submitted by the given username.
  public query func getMyApplications(username : Text) : async [Types.Application] {
    AuthRolesApplications.getApplicationsByUser(state, username);
  };

  /// Return every application regardless of status. Intended for
  /// admin/co-admin use.
  public query func getAllApplications() : async [Types.Application] {
    AuthRolesApplications.getAllApplications(state);
  };

  /// Update an application's status to Accepted or Declined.
  public shared ({ caller }) func reviewApplication(applicationId : Nat, decision : Types.ApplicationStatus) : async Bool {
    ignore caller;
    AuthRolesApplications.reviewApplication(state, applicationId, decision);
  };
};
