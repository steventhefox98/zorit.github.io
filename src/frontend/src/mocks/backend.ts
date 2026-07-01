import { type backendInterface, ApplicationStatus, AppliedRole, PostType, Role, RosterRank, VoteStatus } from "../backend";

// Timestamps in nanoseconds (Motoko Timestamp = bigint). 1 ms = 1_000_000 ns.
const now = Date.now();
const ns = (ms: number) => BigInt(ms) * 1_000_000n;
const minutesAgo = (m: number) => ns(now - m * 60_000);
const hoursAgo = (h: number) => ns(now - h * 3_600_000);

// ---- Sample community data so the Community page renders cards, tallies,
//      and a comment thread during visual QA. --------------------------------
const samplePosts = [
  {
    id: 1n,
    postType: PostType.bugReport,
    title: "Ender pearls vanish when thrown through nether portal",
    authorUsername: "Steve",
    body: "When I throw an ender pearl through a nether portal, the pearl disappears and never lands. Reproduced 3 times in survival. Happens on both client and server side. No error in console. Steps: 1) Stand near nether portal 2) Throw ender pearl through frame 3) Pearl vanishes mid-frame. Expected: pearl teleports player. Actual: pearl gone, player stays.",
    createdAt: hoursAgo(2),
  },
  {
    id: 2n,
    postType: PostType.bugReport,
    title: "Mob spawner ignores light level cap in custom biomes",
    authorUsername: "Alex",
    body: "Spawners in the new crystal caves biome spawn mobs at any light level, ignoring the level 7 cap. Makes the biome unplayable at night.",
    createdAt: minutesAgo(45),
  },
];

const sampleComments: Record<string, Array<{
  id: bigint;
  authorUsername: string;
  content: string;
  timestamp: bigint;
  postId: bigint;
}>> = {
  "1": [
    {
      id: 10n,
      authorUsername: "Steven",
      content: "Confirmed — I can reproduce this on the latest build. Tagging as high priority.",
      timestamp: minutesAgo(110),
      postId: 1n,
    },
    {
      id: 11n,
      authorUsername: "Steve",
      content: "Thanks for the quick look! Let me know if you need a world download.",
      timestamp: minutesAgo(100),
      postId: 1n,
    },
    {
      id: 12n,
      authorUsername: "qbhinoor",
      content: "Likely a chunk-border teleport desync. I'll patch the portal handler this afternoon.",
      timestamp: minutesAgo(30),
      postId: 1n,
    },
  ],
};

const voteStore: Record<string, { approved: bigint; rejected: bigint }> = {
  "1": { approved: 2n, rejected: 0n },
  "2": { approved: 0n, rejected: 1n },
};

export const mockBackend: backendInterface = {
  login: async () => ({ success: true, role: Role.Administrator }),
  register: async () => ({ success: true, role: Role.Member }),
  getMyRole: async () => Role.Administrator,
  getMyApplications: async () => [],
  getAllApplications: async () => [
    {
      id: 1n,
      status: ApplicationStatus.Pending,
      applicantUsername: "CreeperHunter",
      answers: [
        "I have moderated two Minecraft servers for 3 years and know the rules well.",
        "Available evenings and weekends, ~20 hours/week.",
        "I want to help keep the community friendly and grief-free.",
      ],
      appliedRole: AppliedRole.Mod,
      timestamp: hoursAgo(3),
    },
    {
      id: 2n,
      status: ApplicationStatus.Pending,
      applicantUsername: "BlockMaster42",
      answers: [
        "Built spawn structures on three servers and love medieval builds.",
        "Available most afternoons.",
        "Want to contribute to event builds and the new hub.",
      ],
      appliedRole: AppliedRole.Builder,
      timestamp: hoursAgo(8),
    },
  ],
  submitApplication: async () => ({ success: true }),
  reviewApplication: async () => true,
  getStaffDirectory: async () => [
    { username: "Steven", role: Role.Administrator, rank: RosterRank.CoOwner },
    { username: "qbhinoor", role: Role.Administrator, rank: RosterRank.Admin },
    { username: "Notch", role: Role.CoAdministrator, rank: RosterRank.SrCop },
    { username: "Jeb_", role: Role.CoAdministrator, rank: RosterRank.Admin },
  ],
  getStaffConversation: async (_requester, peer) => {
    // Return a small sample thread keyed loosely on peer so the chat panel
    // renders bubbles for both own and peer messages.
    if (peer === "Notch") {
      return [
        {
          id: 1n,
          content: "Hey! Welcome to the staff chat. Ready to build?",
          senderUsername: "Notch",
          recipientUsername: "Steven",
          timestamp: minutesAgo(42),
        },
        {
          id: 2n,
          content: "Absolutely. Just pushed the new pixel cursor.",
          senderUsername: "Steven",
          recipientUsername: "Notch",
          timestamp: minutesAgo(40),
        },
        {
          id: 3n,
          content: "Looks great. Ship it after the next build check.",
          senderUsername: "Notch",
          recipientUsername: "Steven",
          timestamp: minutesAgo(38),
        },
        {
          id: 4n,
          content:
            "Will do. Also added the staff messaging page — this very screen.",
          senderUsername: "Steven",
          recipientUsername: "Notch",
          timestamp: minutesAgo(5),
        },
      ];
    }
    if (peer === "qbhinoor") {
      return [
        {
          id: 10n,
          content: "Morning. Can you review the apply page?",
          senderUsername: "qbhinoor",
          recipientUsername: "Steven",
          timestamp: minutesAgo(120),
        },
        {
          id: 11n,
          content: "On it. Pushing tweaks now.",
          senderUsername: "Steven",
          recipientUsername: "qbhinoor",
          timestamp: minutesAgo(118),
        },
      ];
    }
    return [];
  },
  sendStaffMessage: async () => ({ success: true, messageId: 999n }),
  createCommunityPost: async () => ({ success: true, postId: 999n }),
  listActiveCommunityPosts: async (postType) =>
    samplePosts.filter((p) => p.postType === postType),
  voteOnCommunityPost: async (postId, _voter, status) => {
    const key = String(postId);
    const entry = voteStore[key] ?? { approved: 0n, rejected: 0n };
    if (status === VoteStatus.approved) entry.approved += 1n;
    else entry.rejected += 1n;
    voteStore[key] = entry;
    return { success: true };
  },
  getCommunityVoteTally: async (postId) => {
    const entry = voteStore[String(postId)] ?? { approved: 0n, rejected: 0n };
    return { postId, approved: entry.approved, rejected: entry.rejected };
  },
  addCommunityComment: async (postId, authorUsername, content) => {
    const key = String(postId);
    const list = sampleComments[key] ?? [];
    const newComment = {
      id: BigInt(Date.now()),
      authorUsername,
      content,
      timestamp: ns(Date.now()),
      postId,
    };
    list.push(newComment);
    sampleComments[key] = list;
    return { success: true, commentId: newComment.id };
  },
  listCommunityComments: async (postId) => sampleComments[String(postId)] ?? [],
  getRoster: async () => [
    {
      rank: RosterRank.Owner,
      members: [
        { id: 1n, name: "Franc [Owner]", rank: RosterRank.Owner },
        { id: 2n, name: "woofigames", rank: RosterRank.Owner },
      ],
    },
    {
      rank: RosterRank.CoOwner,
      members: [{ id: 3n, name: "Steven", rank: RosterRank.CoOwner }],
    },
    {
      rank: RosterRank.Admin,
      members: [
        { id: 4n, name: "qbhinoor", rank: RosterRank.Admin },
        { id: 6n, name: "Jeb_", rank: RosterRank.Admin },
      ],
    },
    {
      rank: RosterRank.SrCop,
      members: [{ id: 5n, name: "Notch", rank: RosterRank.SrCop }],
    },
    {
      rank: RosterRank.Mod,
      members: [{ id: 7n, name: "Alex", rank: RosterRank.Mod }],
    },
    {
      rank: RosterRank.Builder,
      members: [{ id: 8n, name: "Dinnerbone", rank: RosterRank.Builder }],
    },
  ],
  getRankSlots: async () => [
    { rank: RosterRank.Owner, slots: 2n },
    { rank: RosterRank.CoOwner, slots: 2n },
    { rank: RosterRank.Manager, slots: 1n },
    { rank: RosterRank.AdvertiseManager, slots: 1n },
    { rank: RosterRank.ChiefAdmin, slots: 1n },
    { rank: RosterRank.SrDeveloper, slots: 2n },
    { rank: RosterRank.Developer, slots: 4n },
    { rank: RosterRank.Admin, slots: 4n },
    { rank: RosterRank.JrAdmin, slots: 4n },
    { rank: RosterRank.Mod, slots: 5n },
    { rank: RosterRank.Cop, slots: 3n },
    { rank: RosterRank.SrCop, slots: 3n },
    { rank: RosterRank.Builder, slots: 5n },
  ],
  setRankSlot: async () => ({ success: true }),
  addStaffRosterMember: async () => ({ success: true }),
  removeStaffRosterMember: async () => ({ success: true }),
  acceptApplication: async () => ({ success: true }),
  declineApplication: async () => true,
  getAllUsers: async () => [
    { username: "Steven", role: Role.Administrator, rank: RosterRank.CoOwner },
    { username: "qbhinoor", role: Role.Administrator, rank: RosterRank.Admin },
    { username: "Notch", role: Role.CoAdministrator, rank: RosterRank.SrCop },
    { username: "Jeb_", role: Role.CoAdministrator, rank: RosterRank.Admin },
    { username: "Alex", role: Role.Mod, rank: RosterRank.Mod },
    { username: "Dinnerbone", role: Role.Builder, rank: RosterRank.Builder },
    { username: "CreeperHunter", role: Role.Member },
    { username: "BlockMaster42", role: Role.Member },
  ],
  setRole: async () => ({ success: true }),
};
