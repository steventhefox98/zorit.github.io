import Map "mo:core/Map";
import Text "mo:core/Text";

actor {
  type PasswordHash = Text;
  type Username = Text;

  let users = Map.empty<Username, PasswordHash>();

  func hashPassword(password : Text) : PasswordHash {
    password;
  };

  public shared ({ caller }) func register(username : Username, password : Text) : async Bool {
    switch (users.get(username)) {
      case (?_) { false };
      case (null) {
        let passwordHash = hashPassword(password);
        users.add(username, passwordHash);
        true;
      };
    };
  };

  public shared ({ caller }) func login(username : Username, password : Text) : async Bool {
    let passwordHash = hashPassword(password);
    switch (users.get(username)) {
      case (?storedHash) { storedHash == passwordHash };
      case (null) { false };
    };
  };
};
