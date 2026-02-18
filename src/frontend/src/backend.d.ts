import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Complaint {
    id: bigint;
    status: Status;
    closed: boolean;
    responses: Array<string>;
    escalated: boolean;
    createdAt: bigint;
    description: string;
    feedback?: Feedback;
    updatedAt: bigint;
    closedAt?: bigint;
    publicId: string;
    category: string;
    priorityScore: PriorityScore;
    escalatedAt?: bigint;
    reporter: Principal;
    afterPhotoId?: string;
    dueAt: bigint;
    location: string;
    photoId: string;
}
export interface Feedback {
    comment: string;
    rating?: bigint;
    confirmed: boolean;
}
export interface PriorityScore {
    urgency: bigint;
    category: string;
    photo: boolean;
    location: string;
}
export interface ComplaintResponse {
    complaint: Complaint;
    publicId: string;
}
export interface ComplaintInput {
    description: string;
    publicId: string;
    category: string;
    location: string;
    photoId: string;
}
export enum Status {
    resolved = "resolved",
    citizenConfirmed = "citizenConfirmed",
    escalated = "escalated",
    open = "open",
    citizenRejected = "citizenRejected",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmationFeedback(compId: bigint, comment: string, rating: bigint | null, confirmed: boolean): Promise<void>;
    duplicateCheck(_desc: string): Promise<boolean>;
    eskalacijaPrijave(id: bigint): Promise<void>;
    fetchAfterPhoto(_photoId: string): Promise<ExternalBlob>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaint(id: bigint): Promise<Complaint | null>;
    getComplaintsByStatus(status: Status): Promise<Array<Complaint>>;
    getOpenComplaints(): Promise<Array<Complaint>>;
    isCallerAdmin(): Promise<boolean>;
    publicComplaintId(userId: bigint): Promise<string>;
    storeAfterPhoto(complaintId: bigint, photoId: string, afterPhoto: ExternalBlob): Promise<void>;
    storePhoto(fileId: string, photo: ExternalBlob): Promise<void>;
    submitComplaint(input: ComplaintInput): Promise<ComplaintResponse>;
    timeLeft(dueAt: bigint): Promise<bigint>;
    updateStatus(id: bigint, status: Status): Promise<void>;
}
