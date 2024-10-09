import Hash "mo:base/Hash";

import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";

actor {
  stable var userInputsEntries : [(Principal, Text)] = [];
  var userInputs = HashMap.HashMap<Principal, Text>(1, Principal.equal, Principal.hash);

  system func preupgrade() {
    userInputsEntries := Iter.toArray(userInputs.entries());
  };

  system func postupgrade() {
    userInputs := HashMap.fromIter<Principal, Text>(userInputsEntries.vals(), 1, Principal.equal, Principal.hash);
  };

  public shared(msg) func submitInput(input: Text) : async () {
    let caller = msg.caller;
    userInputs.put(caller, input);
  };

  public query func getInput(user: Principal) : async ?Text {
    userInputs.get(user)
  };

  public query func getAllInputs() : async [(Principal, Text)] {
    Iter.toArray(userInputs.entries())
  };
}
