import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let storage = Map.empty<Text, Storage.ExternalBlob>();
  include MixinStorage();

  type Status = {
    #open;
    #inProgress;
    #resolved;
    #escalated;
    #citizenConfirmed;
    #citizenRejected;
  };

  type Feedback = {
    comment : Text;
    rating : ?Nat;
    confirmed : Bool;
  };

  type PriorityScore = {
    category : Text;
    urgency : Nat;
    location : Text;
    photo : Bool;
  };

  type ComplaintResponse = {
    complaint : Complaint;
    publicId : Text;
  };

  type Complaint = {
    id : Nat;
    category : Text;
    description : Text;
    location : Text;
    status : Status;
    photoId : Text;
    afterPhotoId : ?Text;
    createdAt : Int;
    updatedAt : Int;
    dueAt : Int;
    reporter : Principal;
    responses : [Text];
    priorityScore : PriorityScore;
    escalated : Bool;
    escalatedAt : ?Int;
    feedback : ?Feedback;
    closed : Bool;
    closedAt : ?Int;
    publicId : Text;
  };

  type ComplaintInternal = Complaint;

  module Complaint {
    public func compare(complaint1 : Complaint, complaint2 : Complaint) : Order.Order {
      Nat.compare(complaint1.id, complaint2.id);
    };
  };

  let COMPLAINT_LIFE_CYCLE = 72 * 60 * 60 * 1000000000;
  var complaintCount = 0;
  let complaintsInternal = Map.empty<Nat, ComplaintInternal>();

  public type ComplaintInput = {
    category : Text;
    description : Text;
    location : Text;
    photoId : Text;
    publicId : Text;
  };

  public shared ({ caller }) func submitComplaint(input : ComplaintInput) : async ComplaintResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit complaints");
    };

    complaintCount += 1;
    let id = complaintCount;
    let now = Time.now();
    let dueAt = now + COMPLAINT_LIFE_CYCLE;

    let priorityScore = calculatePriorityScore({
      category = input.category;
      location = input.location;
      photo = true;
    });

    let newComplaint : ComplaintInternal = {
      id;
      category = input.category;
      description = input.description;
      location = input.location;
      status = #open;
      photoId = input.photoId;
      afterPhotoId = null;
      createdAt = now;
      updatedAt = now;
      dueAt;
      reporter = caller;
      responses = [];
      priorityScore;
      escalated = false;
      escalatedAt = null;
      feedback = null;
      closed = false;
      closedAt = null;
      publicId = input.publicId;
    };

    complaintsInternal.add(id, newComplaint);
    { complaint = newComplaint; publicId = input.publicId };
  };

  public query ({ caller }) func getComplaint(id : Nat) : async ?Complaint {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view complaints");
    };

    let complaint = complaintsInternal.get(id);
    switch (complaint) {
      case (null) { null };
      case (?c) {
        if (c.reporter == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?c;
        } else {
          Runtime.trap("Unauthorized: You can only view your own complaints");
        };
      };
    };
  };

  public query ({ caller }) func getOpenComplaints() : async [Complaint] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view complaints");
    };

    let allComplaints = complaintsInternal.values().toArray();

    if (AccessControl.isAdmin(accessControlState, caller)) {
      return allComplaints;
    };

    allComplaints.filter(func(complaint : Complaint) : Bool {
      complaint.reporter == caller;
    });
  };

  public query ({ caller }) func getComplaintsByStatus(status : Status) : async [Complaint] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view complaints");
    };

    let allComplaints = complaintsInternal.values().toArray();
    let filteredByStatus = allComplaints.filter(func(complaint : Complaint) : Bool {
      complaint.status == status;
    });

    if (AccessControl.isAdmin(accessControlState, caller)) {
      return filteredByStatus;
    };

    filteredByStatus.filter(func(complaint : Complaint) : Bool {
      complaint.reporter == caller;
    });
  };

  public shared ({ caller }) func updateStatus(id : Nat, status : Status) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only officials can update complaint status");
    };

    let complaint = complaintsInternal.get(id);
    switch (complaint) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) {
        let updatedComplaint = {
          c with status;
          updatedAt = Time.now();
        };
        complaintsInternal.add(id, updatedComplaint);
      };
    };
  };

  public query ({ caller }) func duplicateCheck(_desc : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check for duplicates");
    };
    // Placeholder for duplicate checking logic
    true;
  };

  public query ({ caller }) func timeLeft(dueAt : Int) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check time left");
    };

    let now = Time.now();
    let remaining = dueAt - now;
    if (remaining < 0) { 0 } else { remaining };
  };

  public shared ({ caller }) func eskalacijaPrijave(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only higher officials can escalate complaints");
    };

    let complaint = complaintsInternal.get(id);
    switch (complaint) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) {
        let now = Time.now();
        let updatedComplaint = {
          c with
          escalated = true;
          escalatedAt = ?now;
          status = #escalated;
          updatedAt = now;
        };
        complaintsInternal.add(id, updatedComplaint);
      };
    };
  };

  public shared ({ caller }) func confirmationFeedback(compId : Nat, comment : Text, rating : ?Nat, confirmed : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can provide feedback");
    };

    let complaint = complaintsInternal.get(compId);
    switch (complaint) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) {
        if (c.reporter != caller) {
          Runtime.trap("Unauthorized: Only the complaint reporter can provide feedback");
        };

        if (c.status != #resolved) {
          Runtime.trap("Cannot provide feedback: Complaint must be resolved first");
        };

        let feedback : Feedback = {
          comment;
          rating;
          confirmed;
        };

        let newStatus = if (confirmed) { #citizenConfirmed } else { #citizenRejected };

        let updatedComplaint = {
          c with
          feedback = ?feedback;
          status = newStatus;
          updatedAt = Time.now();
        };

        complaintsInternal.add(compId, updatedComplaint);
      };
    };
  };

  public query ({ caller }) func publicComplaintId(userId : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    userId.toText();
  };

  public shared ({ caller }) func storePhoto(fileId : Text, photo : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can store photos");
    };

    storage.add(fileId, photo);
  };

  public shared ({ caller }) func storeAfterPhoto(complaintId : Nat, photoId : Text, afterPhoto : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only officials can submit after photos");
    };

    switch (complaintsInternal.get(complaintId)) {
      case (null) { Runtime.trap("Cannot submit after photo: complaint with id " # complaintId.toText() # " does not exist.") };
      case (?complaint) {
        let updatedComplaint = { complaint with afterPhotoId = ?photoId };
        complaintsInternal.add(complaintId, updatedComplaint);
      };
    };
    storage.add(photoId, afterPhoto);
  };

  public shared query ({ caller }) func fetchAfterPhoto(_photoId : Text) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch photos");
    };

    switch (storage.get(_photoId)) {
      case (null) { Runtime.trap("No such photo id " # _photoId) };
      case (?photo) { photo };
    };
  };

  func calculatePriorityScore(inputs : { category : Text; location : Text; photo : Bool }) : PriorityScore {
    let urgency = switch (inputs.category) {
      case ("High Priority") { 5 };
      case ("Moderate Priority") { 3 };
      case ("Low Priority") { 1 };
      case (_) { 1 };
    };

    {
      category = inputs.category;
      urgency;
      location = inputs.location;
      photo = inputs.photo;
    };
  };
};
