import { type backendInterface, createActor } from "@/backend";
import type {
  AcceptApplicationResult,
  AddCommentResult,
  AddRosterMemberResult,
  Application,
  ApplicationStatus,
  AppliedRole,
  Comment,
  CreatePostResult,
  LoginResult,
  Message,
  Post,
  PostType,
  RankSlot,
  RegisterResult,
  RemoveRosterMemberResult,
  Role,
  RosterGroup,
  RosterRank,
  SendMessageResult,
  SetRankSlotResult,
  SetRoleResult,
  StaffDirectoryEntry,
  SubmitApplicationResult,
  UpdateStaffRosterMemberResult,
  UserEntry,
  VoteResult,
  VoteStatus,
  VoteTally,
} from "@/backend";
import { isMockMode } from "@/lib/mockMode";
import { mockBackend } from "@/mocks/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* ------------------------------------------------------------------
   Actor source — mock backend vs. real canister
   ------------------------------------------------------------------
   When the canister config in env.json is unavailable (string "undefined"
   or falsy), we serve all data from the in-memory mock backend so the SPA
   works on static hosts (Vercel, etc.) outside the IC sandbox. When real
   canister values are present, we use the real `useActor(createActor)`
   path exactly as before.
   ------------------------------------------------------------------ */

function useBackendActor(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  const realActor = useActor(createActor);
  if (isMockMode()) {
    return { actor: mockBackend, isFetching: false };
  }
  return realActor;
}

/* ------------------------------------------------------------------
   Staff messaging queries + mutations
   ------------------------------------------------------------------ */

export function useStaffDirectory(requesterUsername: string | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<StaffDirectoryEntry[]>({
    queryKey: ["staffDirectory", requesterUsername],
    queryFn: async () => {
      if (!actor || !requesterUsername) return [];
      // The backend now excludes the requester's own entry server-side.
      // We pass the current username so the directory cannot contain
      // the user themselves (defense in depth — the client-side filter
      // in Messages.tsx is kept as a safety net).
      return actor.getStaffDirectory(requesterUsername);
    },
    enabled: !!actor && !isFetching && !!requesterUsername,
    refetchInterval: 10000,
  });
}

export function useStaffConversation(
  requesterUsername: string | null,
  peerUsername: string | null,
) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Message[]>({
    queryKey: ["staffConversation", requesterUsername, peerUsername],
    queryFn: async () => {
      if (!actor || !requesterUsername || !peerUsername) return [];
      return actor.getStaffConversation(requesterUsername, peerUsername);
    },
    enabled: !!actor && !isFetching && !!requesterUsername && !!peerUsername,
    refetchInterval: 5000,
  });
}

export function useSendStaffMessage() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    SendMessageResult,
    Error,
    { senderUsername: string; recipientUsername: string; content: string }
  >({
    mutationFn: async ({ senderUsername, recipientUsername, content }) => {
      if (!actor) throw new Error("Backend actor not ready");
      // Client-side 500ms delay so messages do not appear instantly.
      await new Promise((resolve) => setTimeout(resolve, 500));
      return actor.sendStaffMessage(senderUsername, recipientUsername, content);
    },
    meta: { isFetching },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "staffConversation",
          variables.senderUsername,
          variables.recipientUsername,
        ],
      });
    },
  });
}

/* ------------------------------------------------------------------
   Staff roster queries + mutations
   ------------------------------------------------------------------ */

export function useRoster() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<RosterGroup[]>({
    queryKey: ["roster"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRoster();
    },
    enabled: !!actor && !isFetching,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });
}

export function useAddStaffRosterMember() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    AddRosterMemberResult,
    Error,
    { callerUsername: string; name: string; rank: RosterRank }
  >({
    mutationFn: async ({ callerUsername, name, rank }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.addStaffRosterMember(callerUsername, name, rank);
    },
    meta: { isFetching },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roster"] });
    },
  });
}

export function useRemoveStaffRosterMember() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    RemoveRosterMemberResult,
    Error,
    { callerUsername: string; memberId: bigint }
  >({
    mutationFn: async ({ callerUsername, memberId }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.removeStaffRosterMember(callerUsername, memberId);
    },
    meta: { isFetching },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roster"] });
    },
  });
}

/**
 * Administrator-only mutation to change a roster member's rank. On success,
 * invalidates the same caches as add/remove (roster + rankSlots) so the
 * member re-renders under the new rank group and slot counts stay accurate.
 */
export function useUpdateStaffRosterMember() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    UpdateStaffRosterMemberResult,
    Error,
    { callerUsername: string; memberId: bigint; targetRank: RosterRank }
  >({
    mutationFn: async ({ callerUsername, memberId, targetRank }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.updateStaffRosterMember(
        callerUsername,
        memberId,
        targetRank,
      );
    },
    meta: { isFetching },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roster"] });
      queryClient.invalidateQueries({ queryKey: ["rankSlots"] });
    },
  });
}

/* ------------------------------------------------------------------
   Rank slot counts (editable per-rank capacity, admin-protected writes)
   ------------------------------------------------------------------ */

export function useRankSlots() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<RankSlot[]>({
    queryKey: ["rankSlots"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRankSlots();
    },
    enabled: !!actor && !isFetching,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });
}

export function useSetRankSlot() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    SetRankSlotResult,
    Error,
    { callerUsername: string; rank: RosterRank; slots: bigint }
  >({
    mutationFn: async ({ callerUsername, rank, slots }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.setRankSlot(callerUsername, rank, slots);
    },
    meta: { isFetching },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rankSlots"] });
    },
  });
}

/* ------------------------------------------------------------------
   Application accept/decline (two-step accept flow)
   ------------------------------------------------------------------ */

export function useAcceptApplication() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    AcceptApplicationResult,
    Error,
    { callerUsername: string; applicationId: bigint; assignedRank: RosterRank }
  >({
    mutationFn: async ({ callerUsername, applicationId, assignedRank }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.acceptApplication(
        callerUsername,
        applicationId,
        assignedRank,
      );
    },
    meta: { isFetching },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
      queryClient.invalidateQueries({ queryKey: ["staffDirectory"] });
    },
  });
}

export function useDeclineApplication() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, { applicationId: bigint }>({
    mutationFn: async ({ applicationId }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.declineApplication(applicationId);
    },
    meta: { isFetching },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

/* ------------------------------------------------------------------
   Auth mutations
   ------------------------------------------------------------------ */

export function useRegister() {
  const { actor, isFetching } = useBackendActor();
  return useMutation<
    RegisterResult,
    Error,
    { username: string; password: string }
  >({
    mutationFn: async ({ username, password }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.register(username, password);
    },
    meta: { isFetching },
  });
}

export function useLogin() {
  const { actor, isFetching } = useBackendActor();
  return useMutation<
    LoginResult,
    Error,
    { username: string; password: string }
  >({
    mutationFn: async ({ username, password }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.login(username, password);
    },
    meta: { isFetching },
  });
}

/* ------------------------------------------------------------------
   Role queries
   ------------------------------------------------------------------ */

export function useGetMyRole(username: string | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Role | null>({
    queryKey: ["myRole", username],
    queryFn: async () => {
      if (!actor || !username) return null;
      return actor.getMyRole(username);
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

/**
 * Fetch every registered user (all roles, not just staff). Used by the
 * admin-only role-management UI. Returns UserEntry[] where rank is an
 * optional RosterRank (absent for users with no roster slot).
 */
export function useGetAllUsers() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<UserEntry[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
    refetchOnWindowFocus: true,
    staleTime: 30000,
  });
}

/**
 * Administrator-only mutation to change a user's Role. On success,
 * invalidates the allUsers, staffDirectory, and roster query caches so
 * every surface that depends on role membership re-fetches.
 */
export function useSetRole() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    SetRoleResult,
    Error,
    { callerUsername: string; targetUsername: string; newRole: Role }
  >({
    mutationFn: async ({ callerUsername, targetUsername, newRole }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.setRole(callerUsername, targetUsername, newRole);
    },
    meta: { isFetching },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["staffDirectory"] });
      queryClient.invalidateQueries({ queryKey: ["roster"] });
    },
  });
}

/* ------------------------------------------------------------------
   Application queries + mutations
   ------------------------------------------------------------------ */

export function useGetMyApplications(username: string | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Application[]>({
    queryKey: ["myApplications", username],
    queryFn: async () => {
      if (!actor || !username) return [];
      return actor.getMyApplications(username);
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

export function useGetAllApplications() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Application[]>({
    queryKey: ["allApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitApplication() {
  const { actor, isFetching } = useBackendActor();
  return useMutation<
    SubmitApplicationResult,
    Error,
    { username: string; appliedRole: AppliedRole; answers: string[] }
  >({
    mutationFn: async ({ username, appliedRole, answers }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.submitApplication(username, appliedRole, answers);
    },
    meta: { isFetching },
  });
}

export function useReviewApplication() {
  const { actor, isFetching } = useBackendActor();
  return useMutation<
    boolean,
    Error,
    { applicationId: bigint; decision: ApplicationStatus }
  >({
    mutationFn: async ({ applicationId, decision }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.reviewApplication(applicationId, decision);
    },
    meta: { isFetching },
  });
}

/* ------------------------------------------------------------------
   Community posts + voting + comments
   ------------------------------------------------------------------ */

export function useActiveCommunityPosts(postType: PostType) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Post[]>({
    queryKey: ["activeCommunityPosts", postType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveCommunityPosts(postType);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useCreateCommunityPost() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    CreatePostResult,
    Error,
    { postType: PostType; title: string; body: string; authorUsername: string }
  >({
    mutationFn: async ({ postType, title, body, authorUsername }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.createCommunityPost(postType, title, body, authorUsername);
    },
    meta: { isFetching },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["activeCommunityPosts", variables.postType],
      });
    },
  });
}

export function useVoteOnCommunityPost() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    VoteResult,
    Error,
    { postId: bigint; voterUsername: string; status: VoteStatus }
  >({
    mutationFn: async ({ postId, voterUsername, status }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.voteOnCommunityPost(postId, voterUsername, status);
    },
    meta: { isFetching },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["communityVoteTally", variables.postId],
      });
    },
  });
}

export function useCommunityVoteTally(postId: bigint | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<VoteTally>({
    queryKey: ["communityVoteTally", postId],
    queryFn: async () => {
      if (!actor || postId === null) {
        return { postId: 0n, approved: 0n, rejected: 0n };
      }
      return actor.getCommunityVoteTally(postId);
    },
    enabled: !!actor && !isFetching && postId !== null,
    refetchInterval: 10000,
  });
}

export function useCommunityComments(postId: bigint | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<Comment[]>({
    queryKey: ["communityComments", postId],
    queryFn: async () => {
      if (!actor || postId === null) return [];
      return actor.listCommunityComments(postId);
    },
    enabled: !!actor && !isFetching && postId !== null,
    refetchInterval: 5000,
  });
}

export function useAddCommunityComment() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    AddCommentResult,
    Error,
    { postId: bigint; authorUsername: string; content: string }
  >({
    mutationFn: async ({ postId, authorUsername, content }) => {
      if (!actor) throw new Error("Backend actor not ready");
      return actor.addCommunityComment(postId, authorUsername, content);
    },
    meta: { isFetching },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["communityComments", variables.postId],
      });
    },
  });
}
