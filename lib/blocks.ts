"use client";

const BASE_BLOCKED_BY_ME_KEY = "campusloop_blocked_users";
const BASE_BLOCKED_BY_OTHERS_KEY = "campusloop_blocked_by_users";

export interface UserBlocksData {
  blockedUserIds: string[]; // Users I have blocked
  blockedByUserIds: string[]; // Users who blocked me
}

function resolveCurrentUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("campusloop_user");
    if (raw && raw !== "LOGGED_OUT") {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return "";
}

function getScopedKey(base: string, userId?: string): string {
  const uid = userId || resolveCurrentUserId();
  return uid ? `${base}_${uid}` : base;
}

export function getLocalBlockedUserIds(userId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getScopedKey(BASE_BLOCKED_BY_ME_KEY, userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalBlockedByUserIds(userId?: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getScopedKey(BASE_BLOCKED_BY_OTHERS_KEY, userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isUserBlocked(targetUserId: string, currentUserId?: string): boolean {
  if (!targetUserId) return false;
  const blocked = getLocalBlockedUserIds(currentUserId);
  return blocked.includes(targetUserId);
}

export function isUserBlockedBy(targetUserId: string, currentUserId?: string): boolean {
  if (!targetUserId) return false;
  const blockedBy = getLocalBlockedByUserIds(currentUserId);
  return blockedBy.includes(targetUserId);
}

export async function fetchUserBlocks(userId?: string): Promise<UserBlocksData> {
  const uid = userId || resolveCurrentUserId();
  if (!uid) return { blockedUserIds: [], blockedByUserIds: [] };

  try {
    const res = await fetch(`/api/users/block?userId=${encodeURIComponent(uid)}`);
    const data = await res.json();

    if (res.ok && data) {
      const blockedUserIds = data.blockedUserIds || [];
      const blockedByUserIds = data.blockedByUserIds || [];

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(getScopedKey(BASE_BLOCKED_BY_ME_KEY, uid), JSON.stringify(blockedUserIds));
          localStorage.setItem(getScopedKey(BASE_BLOCKED_BY_OTHERS_KEY, uid), JSON.stringify(blockedByUserIds));
          window.dispatchEvent(new Event("campusloop_blocks_changed"));
        } catch {}
      }

      return { blockedUserIds, blockedByUserIds };
    }
  } catch (err) {
    console.warn("fetchUserBlocks notice:", err);
  }

  return {
    blockedUserIds: getLocalBlockedUserIds(uid),
    blockedByUserIds: getLocalBlockedByUserIds(uid),
  };
}

export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
  if (!blockerId || !blockedId) return false;

  const key = getScopedKey(BASE_BLOCKED_BY_ME_KEY, blockerId);
  // Snapshot previous local list
  const prevList = [...getLocalBlockedUserIds(blockerId)];

  // 1. Optimistic local update
  if (typeof window !== "undefined") {
    try {
      if (!prevList.includes(blockedId)) {
        const nextList = [...prevList, blockedId];
        localStorage.setItem(key, JSON.stringify(nextList));
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

    if (!res.ok) {
      // Restore previous snapshot on failure
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(prevList));
        window.dispatchEvent(new Event("campusloop_blocks_changed"));
      }
      return false;
    }

    return true;
  } catch (err) {
    console.warn("blockUser exception:", err);
    // Restore previous snapshot on error
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(prevList));
      window.dispatchEvent(new Event("campusloop_blocks_changed"));
    }
    return false;
  }
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  if (!blockerId || !blockedId) return false;

  const key = getScopedKey(BASE_BLOCKED_BY_ME_KEY, blockerId);
  // Snapshot previous local list
  const prevList = [...getLocalBlockedUserIds(blockerId)];

  // 1. Optimistic local update
  if (typeof window !== "undefined") {
    try {
      const nextList = prevList.filter((id) => id !== blockedId);
      localStorage.setItem(key, JSON.stringify(nextList));
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

    if (!res.ok) {
      // Restore previous snapshot on failure
      if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(prevList));
        window.dispatchEvent(new Event("campusloop_blocks_changed"));
      }
      return false;
    }

    return true;
  } catch (err) {
    console.warn("unblockUser exception:", err);
    // Restore previous snapshot on error
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(prevList));
      window.dispatchEvent(new Event("campusloop_blocks_changed"));
    }
    return false;
  }
}
