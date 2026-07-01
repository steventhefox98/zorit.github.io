import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Time "mo:core/Time";
import Types "../types/auth-roles-applications";
import Common "../types/common";

module {
  public type State = {
    users : Map.Map<Common.Username, Types.User>;
    applications : Map.Map<Common.ApplicationId, Types.Application>;
    var nextApplicationId : Common.ApplicationId;
  };

  /// Hash a plaintext password into a stored hash. Uses a simple
  /// deterministic fold over the UTF-8 codepoints — sufficient as a
  /// non-reversible stored credential for this demo backend.
  public func hashPassword(password : Text) : Common.PasswordHash {
    password.foldLeft(
      0,
      func(acc, char) {
        let code = char.toNat32();
        (acc * 31 + Nat32.toNat(code)) % 1_000_000_007;
      },
    ).toText();
  };

  /// Resolve the role for a new user. Steven and Qbhinoor are auto-assigned
  /// Administrator; everyone else defaults to Member.
  public func roleForUsername(username : Common.Username) : Types.Role {
    let normalized = toLower(username);
    if (normalized == "steven" or normalized == "qbhinoor") {
      #Administrator;
    } else {
      #Member;
    };
  };

  /// Register a new user. Returns failure if the username already exists.
  public func register(state : State, username : Common.Username, password : Text) : Types.RegisterResult {
    let normalized = toLower(username);
    switch (state.users.get(normalized)) {
      case (?_user) {
        { success = false; role = #Member };
      };
      case null {
        let role = roleForUsername(username);
        let user : Types.User = {
          username;
          passwordHash = hashPassword(password);
          role;
        };
        state.users.add(normalized, user);
        { success = true; role };
      };
    };
  };

  /// Validate credentials and return the user's role on success.
  public func login(state : State, username : Common.Username, password : Text) : Types.LoginResult {
    let normalized = toLower(username);
    switch (state.users.get(normalized)) {
      case null { { success = false; role = #Member } };
      case (?user) {
        if (user.passwordHash == hashPassword(password)) {
          { success = true; role = user.role };
        } else {
          { success = false; role = #Member };
        };
      };
    };
  };

  /// Look up a user's role by username.
  public func getRole(state : State, username : Common.Username) : ?Types.Role {
    let normalized = toLower(username);
    switch (state.users.get(normalized)) {
      case null null;
      case (?user) ?user.role;
    };
  };

  /// Submit a new application with status Pending. Returns the new
  /// application id on success. Variant-agnostic — accepts any AppliedRole
  /// (#Mod, #Admin, #Builder, #Developer). Returns failure if the username
  /// is not registered.
  public func submitApplication(state : State, username : Common.Username, appliedRole : Types.AppliedRole, answers : [Text]) : Types.SubmitApplicationResult {
    let normalized = toLower(username);
    switch (state.users.get(normalized)) {
      case null { { success = false; applicationId = null } };
      case (?user) {
        let id = state.nextApplicationId;
        let application : Types.Application = {
          id;
          applicantUsername = user.username;
          appliedRole;
          answers;
          timestamp = Time.now();
          status = #Pending;
        };
        state.applications.add(id, application);
        state.nextApplicationId := id + 1;
        { success = true; applicationId = ?id };
      };
    };
  };

  /// Return all applications submitted by the given username.
  public func getApplicationsByUser(state : State, username : Common.Username) : [Types.Application] {
    let normalized = toLower(username);
    let all = state.applications.toArray().map(
      func((_id, application)) { application }
    );
    all.filter(
      func(application) { toLower(application.applicantUsername) == normalized }
    );
  };

  /// Return every application regardless of status (admin/co-admin use).
  public func getAllApplications(state : State) : [Types.Application] {
    state.applications.toArray().map(
      func((_id, application)) { application }
    );
  };

  /// Update an application's status to Accepted or Declined. Returns false
  /// if the application id does not exist or is no longer Pending.
  public func reviewApplication(state : State, applicationId : Common.ApplicationId, decision : Types.ApplicationStatus) : Bool {
    switch (state.applications.get(applicationId)) {
      case null false;
      case (?application) {
        switch (application.status) {
          case (#Pending) {
            state.applications.add(applicationId, { application with status = decision });
            true;
          };
          case _ false;
        };
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
