import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Char "mo:core/Char";
import Types "../types/auth-roles-applications";
import Common "../types/common";

module {
  public type State = {
    users : Map.Map<Common.Username, Types.User>;
    applications : Map.Map<Common.ApplicationId, Types.Application>;
    var nextApplicationId : Common.ApplicationId;
  };

  /// Hash a plaintext password into a stored hash.
  /// NOTE: identity hash — no real hashing. See AGENTS.md learnings.
  public func hashPassword(password : Text) : Common.PasswordHash {
    password;
  };

  /// Resolve the role for a new user: Administrator for Steven/Qbhinoor
  /// (case-insensitive), otherwise Member.
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
      case (?_) {
        { success = false; role = #Member };
      };
      case null {
        let role = roleForUsername(username);
        let user : Types.User = {
          username;
          passwordHash = hashPassword(password);
          role;
          avatar = null;
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
      case (?user) {
        if (user.passwordHash == hashPassword(password)) {
          { success = true; role = user.role };
        } else {
          { success = false; role = #Member };
        };
      };
      case null {
        { success = false; role = #Member };
      };
    };
  };

  /// Look up a user's role by username.
  public func getRole(state : State, username : Common.Username) : ?Types.Role {
    let normalized = toLower(username);
    switch (state.users.get(normalized)) {
      case (?user) ?user.role;
      case null null;
    };
  };

  /// Submit a new application with status Pending, a generated id, and the
  /// current timestamp. Returns the new application id on success.
  public func submitApplication(state : State, username : Common.Username, appliedRole : Types.AppliedRole, answers : [Text]) : Types.SubmitApplicationResult {
    let normalized = toLower(username);
    switch (state.users.get(normalized)) {
      case null {
        { success = false; applicationId = null };
      };
      case (?_) {
        let id = state.nextApplicationId;
        let application : Types.Application = {
          id;
          applicantUsername = username;
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

  /// Return all applications submitted by the given username, sorted by
  /// timestamp descending.
  public func getApplicationsByUser(state : State, username : Common.Username) : [Types.Application] {
    let normalized = toLower(username);
    let all = state.applications.toArray().map(
      func((_id, app)) { app }
    );
    let matched = all.filter(
      func(app) {
        toLower(app.applicantUsername) == normalized;
      }
    );
    matched.sort(func(a, b) {
      Int.compare(b.timestamp, a.timestamp);
    });
  };

  /// Return every application regardless of status (admin/co-admin use),
  /// sorted by timestamp descending.
  public func getAllApplications(state : State) : [Types.Application] {
    let all = state.applications.toArray().map(
      func((_id, app)) { app }
    );
    all.sort(
      func(a, b) {
        Int.compare(b.timestamp, a.timestamp);
      }
    );
  };

  /// Update an application's status to Accepted or Declined. Returns false if
  /// the application id does not exist.
  public func reviewApplication(state : State, applicationId : Common.ApplicationId, decision : Types.ApplicationStatus) : Bool {
    switch (state.applications.get(applicationId)) {
      case null false;
      case (?app) {
        state.applications.add(applicationId, { app with status = decision });
        true;
      };
    };
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
