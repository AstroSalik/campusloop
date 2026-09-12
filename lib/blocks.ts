"use client";

const BLOCKED_BY_ME_KEY = "campusloop_blocked_users";
const BLOCKED_BY_OTHERS_KEY = "campusloop_blocked_by_users";

export interface UserBlocksData {
  blockedUserIds: string[]; // Users I have blocked
  blockedByUserIds: string[]; // Users who blocked me
}

export function getLocalBlockedUserIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BLOCKED_BY_ME_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalBlockedByUserIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BLOCKED_BY_OTHERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isUserBlocked(targetUserId: string): boolean {
  if (!targetUserId) return false;
  const blocked = getLocalBlockedUserIds();
  return blocked.includes(targetUserId);
}

export function isUserBlockedBy(targetUserId: string): boolean {
  if (!targetUserId) return false;
  const blockedBy = getLocalBlockedByUserIds();
  return blockedBy.includes(targetUserId);
}

export async function fetchUserBlocks(userId: string): Promise<UserBlocksData> {
  if (!userId) return { blockedUserIds: [], blockedByUserIds: [] };

  try {
    const res = await fetch(`/api/users/block?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();

    if (res.ok && data) {
      const blockedUserIds = data.blockedUserIds || [];
      const blockedByUserIds = data.blockedByUserIds || [];

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(BLOCKED_BY_ME_KEY, JSON.stringify(blockedUserIds));
          localStorage.setItem(BLOCKED_BY_OTHERS_KEY, JSON.stringify(blockedByUserIds));
          window.dispatchEvent(new Event("campusloop_blocks_changed"));
        } catch {}
      }

      return { blockedUserIds, blockedByUserIds };
    }
  } catch (err) {
    console.warn("fetchUserBlocks notice:", err);
  }

  return {
    blockedUserIds: getLocalBlockedUserIds(),
    blockedByUserIds: getLocalBlockedByUserIds(),
  };
}

export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
  if (!blockerId || !blockedId) return false;

  // 1. Optimistic local update
  if (typeof window !== "undefined") {
    try {
      const list = getLocalBlockedUserIds();
      if (!list.includes(blockedId)) {
        list.push(blockedId);
        localStorage.setItem(BLOCKED_BY_ME_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event("campusloop_blocks_changed"));
      }
    } catch {}
  }

  // 2. Cloud update via API
  try {
    const res = await fetch("/api/users/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockerId,
        blockedId,
        action: "block",
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("blockUser exception:", err);
    return true;
  }
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  if (!blockerId || !blockedId) return false;

  // 1. Optimistic local update
  if (typeof window !== "undefined") {
    try {
      const list = getLocalBlockedUserIds().filter((id) => id !== blockedId);
      localStorage.setItem(BLOCKED_BY_ME_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("campusloop_blocks_changed"));
    } catch {}
  }

  // 2. Cloud update via API
  try {
    const res = await fetch("/api/users/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockerId,
        blockedId,
        action: "unblock",
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("unblockUser exception:", err);
    return true;
  }
}
