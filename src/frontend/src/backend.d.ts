import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface CreatePostResult {
    success: boolean;
    postId?: PostId;
}
export interface RemoveRosterMemberResult {
    success: boolean;
}
export interface Application {
    id: ApplicationId;
    status: ApplicationStatus;
    applicantUsername: Username;
    answers: Array<string>;
    appliedRole: AppliedRole;
    timestamp: Timestamp;
}
export interface VoteResult {
    success: boolean;
}
export interface SetRankSlotResult {
    success: boolean;
}
export interface SetAvatarResult {
    success: boolean;
}
export type PostId = bigint;
export interface AcceptApplicationResult {
    success: boolean;
}
export interface RankSlot {
    rank: RosterRank;
    slots: bigint;
}
export interface RegisterResult {
    role: Role;
    success: boolean;
}
export interface Post {
    id: PostId;
    postType: PostType;
    title: string;
    authorUsername: Username;
    body: string;
    createdAt: Timestamp;
}
export interface StaffDirectoryEntry {
    username: Username;
    rank?: RosterRank;
    role: Role;
}
export type Username = string;
export interface RosterMember {
    id: RosterMemberId;
    name: string;
    rank: RosterRank;
}
export type CommentId = bigint;
export interface Comment {
    id: CommentId;
    authorUsername: Username;
    content: string;
    timestamp: Timestamp;
    postId: PostId;
}
export type Avatar = {
    __kind__: "uploaded";
    uploaded: BlobRef;
} | {
    __kind__: "preset";
    preset: string;
};
export interface SubmitApplicationResult {
    applicationId?: ApplicationId;
    success: boolean;
}
export type RosterMemberId = bigint;
export interface VoteTally {
    approved: bigint;
    rejected: bigint;
    postId: PostId;
}
export interface SendMessageResult {
    messageId?: MessageId;
    success: boolean;
}
export interface SetRoleResult {
    error?: string;
    success: boolean;
}
export interface AddCommentResult {
    commentId?: CommentId;
    success: boolean;
}
export interface RosterGroup {
    members: Array<RosterMember>;
    rank: RosterRank;
}
export interface UserEntry {
    username: Username;
    rank?: RosterRank;
    role: Role;
}
export type MessageId = bigint;
export interface AddRosterMemberResult {
    memberId?: RosterMemberId;
    success: boolean;
}
export interface Message {
    id: MessageId;
    content: string;
    senderUsername: Username;
    timestamp: Timestamp;
    recipientUsername: Username;
}
export interface LoginResult {
    role: Role;
    success: boolean;
}
export interface BlobRef {
    key: string;
    contentType: string;
}
export type ApplicationId = bigint;
export enum ApplicationStatus {
    Accepted = "Accepted",
    Declined = "Declined",
    Pending = "Pending"
}
export enum AppliedRole {
    Mod = "Mod",
    Builder = "Builder",
    Admin = "Admin"
}
export enum PostType {
    eventSuggestion = "eventSuggestion",
    suggestion = "suggestion",
    bugReport = "bugReport"
}
export enum Role {
    Cop = "Cop",
    Mod = "Mod",
    SrDeveloper = "SrDeveloper",
    CoOwner = "CoOwner",
    SrCop = "SrCop",
    Administrator = "Administrator",
    Member = "Member",
    Builder = "Builder",
    JrAdmin = "JrAdmin",
    ChiefAdmin = "ChiefAdmin",
    CoAdministrator = "CoAdministrator",
    Developer = "Developer",
    Admin = "Admin",
    AdvertiseManager = "AdvertiseManager",
    Owner = "Owner",
    Manager = "Manager"
}
export enum RosterRank {
    Cop = "Cop",
    Mod = "Mod",
    SrDeveloper = "SrDeveloper",
    CoOwner = "CoOwner",
    SrCop = "SrCop",
    Builder = "Builder",
    JrAdmin = "JrAdmin",
    ChiefAdmin = "ChiefAdmin",
    Developer = "Developer",
    Admin = "Admin",
    AdvertiseManager = "AdvertiseManager",
    Owner = "Owner",
    Manager = "Manager"
}
export enum VoteStatus {
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    acceptApplication(callerUsername: string, applicationId: bigint, assignedRank: RosterRank): Promise<AcceptApplicationResult>;
    addCommunityComment(postId: bigint, authorUsername: string, content: string): Promise<AddCommentResult>;
    addStaffRosterMember(callerUsername: string, name: string, rank: RosterRank): Promise<AddRosterMemberResult>;
    createCommunityPost(postType: PostType, title: string, body: string, authorUsername: string): Promise<CreatePostResult>;
    declineApplication(applicationId: bigint): Promise<boolean>;
    getAllApplications(): Promise<Array<Application>>;
    getAllUsers(): Promise<Array<UserEntry>>;
    getAvatar(username: string): Promise<Avatar | null>;
    /**
     * / applications : ApplicationId -> Application (persisted across upgrades).
     */
    getCommunityVoteTally(postId: bigint): Promise<VoteTally>;
    getMyApplications(username: string): Promise<Array<Application>>;
    getMyRole(username: string): Promise<Role | null>;
    getRankSlots(): Promise<Array<RankSlot>>;
    getRoster(): Promise<Array<RosterGroup>>;
    getStaffConversation(requesterUsername: string, peerUsername: string): Promise<Array<Message>>;
    /**
     * / users : Username -> User (persisted across upgrades via enhanced
     * / orthogonal persistence).
     */
    getStaffDirectory(requesterUsername: string): Promise<Array<StaffDirectoryEntry>>;
    listActiveCommunityPosts(postType: PostType): Promise<Array<Post>>;
    /**
     * / Auth/applications state record shared with mixins — wrapped so `var`
     * / mutations propagate.
     */
    listCommunityComments(postId: bigint): Promise<Array<Comment>>;
    login(username: string, password: string): Promise<LoginResult>;
    register(username: string, password: string): Promise<RegisterResult>;
    removeStaffRosterMember(callerUsername: string, memberId: bigint): Promise<RemoveRosterMemberResult>;
    reviewApplication(applicationId: bigint, decision: ApplicationStatus): Promise<boolean>;
    sendStaffMessage(senderUsername: string, recipientUsername: string, content: string): Promise<SendMessageResult>;
    setMyAvatar(username: string, avatar: Avatar): Promise<SetAvatarResult>;
    setRankSlot(callerUsername: string, rank: RosterRank, slots: bigint): Promise<SetRankSlotResult>;
    setRole(callerUsername: string, targetUsername: string, newRole: Role): Promise<SetRoleResult>;
    submitApplication(username: string, appliedRole: AppliedRole, answers: Array<string>): Promise<SubmitApplicationResult>;
    voteOnCommunityPost(postId: bigint, voterUsername: string, status: VoteStatus): Promise<VoteResult>;
}
