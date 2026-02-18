import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldComplaint = {
    id : Nat;
    category : Text;
    description : Text;
    location : Text;
    status : {
      #open;
      #inProgress;
      #resolved;
      #escalated;
      #citizenConfirmed;
      #citizenRejected;
    };
    photoId : Text;
    createdAt : Int;
    updatedAt : Int;
    dueAt : Int;
    reporter : Principal;
    responses : [Text];
    priorityScore : {
      category : Text;
      urgency : Nat;
      location : Text;
      photo : Bool;
    };
    escalated : Bool;
    escalatedAt : ?Int;
    feedback : ?{
      comment : Text;
      rating : ?Nat;
      confirmed : Bool;
    };
    closed : Bool;
    closedAt : ?Int;
    publicId : Text;
  };

  type NewComplaint = {
    id : Nat;
    category : Text;
    description : Text;
    location : Text;
    status : {
      #open;
      #inProgress;
      #resolved;
      #escalated;
      #citizenConfirmed;
      #citizenRejected;
    };
    photoId : Text;
    afterPhotoId : ?Text;
    createdAt : Int;
    updatedAt : Int;
    dueAt : Int;
    reporter : Principal;
    responses : [Text];
    priorityScore : {
      category : Text;
      urgency : Nat;
      location : Text;
      photo : Bool;
    };
    escalated : Bool;
    escalatedAt : ?Int;
    feedback : ?{
      comment : Text;
      rating : ?Nat;
      confirmed : Bool;
    };
    closed : Bool;
    closedAt : ?Int;
    publicId : Text;
  };

  type OldActor = {
    complaintsInternal : Map.Map<Nat, OldComplaint>;
    storage : Map.Map<Text, Storage.ExternalBlob>;
    complaintCount : Nat;
  };

  type NewActor = {
    complaintsInternal : Map.Map<Nat, NewComplaint>;
    storage : Map.Map<Text, Storage.ExternalBlob>;
    complaintCount : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newComplaints = old.complaintsInternal.map<Nat, OldComplaint, NewComplaint>(
      func(_id, oldComplaint) {
        { oldComplaint with afterPhotoId = null };
      }
    );
    {
      old with complaintsInternal = newComplaints;
    };
  };
};
