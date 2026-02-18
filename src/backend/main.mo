import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let storage = Map.empty<Text, Storage.ExternalBlob>();

  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
    rating : ?Nat; // 0-5
    confirmed : Bool;
  };

  type PriorityScore = {
    category : Text;
    urgency : Nat; // 1-5
    location : Text;
    photo : Bool;
  };

  type ComplaintResponse = {
    complaint : Complaint;
    publicId : Text;
  };

  // Public Complaint
  type Complaint = {
    id : Nat;
    category : Text;
    description : Text;
    location : Text;
    status : Status;
    photoId : Text;
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

  // Internal complaint type
  type ComplaintInternal = Complaint;

  module Complaint {
    public func compare(complaint1 : Complaint, complaint2 : Complaint) : Order.Order {
      Nat.compare(complaint1.id, complaint2.id);
    };
  };

  let COMPLAINT_LIFE_CYCLE = 72 * 60 * 60 * 1000000000;
  var complaintCount = 0;
  let complaintsInternal = Map.empty<Nat, ComplaintInternal>();

  // Role mapping: 
  // #user = Citizen (can submit complaints)
  // #admin = Official/Higher Official (can manage complaints)
  // For this implementation, we use the existing role system where:
  // - Citizens are #user role
  // - Officials and Higher Officials are #admin role
  // Future enhancement: Add custom role types for Official vs Higher Official distinction

  public type ComplaintInput = {
    category : Text;
    description : Text;
    location : Text;
    photoId : Text;
    publicId : Text;
  };

  public shared ({ caller }) func submitComplaint(input : ComplaintInput) : async ComplaintResponse {
    // Only authenticated users (Citizens) can submit complaints
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
    // Only authenticated users can view complaints
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view complaints");
    };

    let complaint = complaintsInternal.get(id);
    switch (complaint) {
      case (null) { null };
      case (?c) {
        // Citizens can only view their own complaints
        // Officials (admins) can view all complaints
        if (c.reporter == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?c;
        } else {
          Runtime.trap("Unauthorized: You can only view your own complaints");
        };
      };
    };
  };

  public query ({ caller }) func getOpenComplaints() : async [Complaint] {
    // Only authenticated users can view complaints
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view complaints");
    };

    let allComplaints = complaintsInternal.values().toArray();

    // If caller is admin (Official), return all complaints
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return allComplaints;
    };

    // If caller is regular user (Citizen), return only their complaints
    allComplaints.filter(func(complaint : Complaint) : Bool {
      complaint.reporter == caller;
    });
  };

  public query ({ caller }) func getComplaintsByStatus(status : Status) : async [Complaint] {
    // Only authenticated users can view complaints
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view complaints");
    };

    let allComplaints = complaintsInternal.values().toArray();
    let filteredByStatus = allComplaints.filter(func(complaint : Complaint) : Bool {
      complaint.status == status;
    });

    // If caller is admin (Official), return all complaints with this status
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return filteredByStatus;
    };

    // If caller is regular user (Citizen), return only their complaints with this status
    filteredByStatus.filter(func(complaint : Complaint) : Bool {
      complaint.reporter == caller;
    });
  };

  public shared ({ caller }) func updateStatus(id : Nat, status : Status) : async () {
    // Only Officials (admins) can update complaint status
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

  public shared ({ caller }) func eskalacijaPrijave(id : Nat) : async () {
    // Only Higher Officials (admins) can escalate complaints
    // In current implementation, all admins can escalate
    // Future enhancement: Add separate Higher Official role
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

  public query ({ caller }) func duplicateCheck(desc : Text) : async Bool {
    // Only authenticated users can check for duplicates
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check for duplicates");
    };

    // Mock method for duplicate complaints
    // Future implementation: Check against existing open complaints
    true;
  };

  public query ({ caller }) func timeLeft(dueAt : Int) : async Int {
    // Any authenticated user can calculate time left
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check time left");
    };

    let now = Time.now();
    let remaining = dueAt - now;
    if (remaining < 0) { 0 } else { remaining };
  };

  public shared ({ caller }) func confirmationFeedback(compId : Nat, comment : Text, rating : ?Nat, confirmed : Bool) : async () {
    // Only authenticated users can provide feedback
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can provide feedback");
    };

    let complaint = complaintsInternal.get(compId);
    switch (complaint) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?c) {
        // Only the original reporter can provide feedback on their complaint
        if (c.reporter != caller) {
          Runtime.trap("Unauthorized: Only the complaint reporter can provide feedback");
        };

        // Can only provide feedback on resolved complaints
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
    // Any authenticated user can generate public IDs
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this function");
    };

    userId.toText();
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
