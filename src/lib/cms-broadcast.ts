// Lightweight cross-tab signal: admin broadcasts on every CMS save, the
// public site listens and invalidates the site-content query so edits
// reflect instantly in already-open tabs (no manual refresh).
const CHANNEL = "truhub-cms";
const EVENT = "cms-updated";

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(CHANNEL);
}

export function broadcastCmsUpdate() {
  const bc = getChannel();
  if (!bc) return;
  try {
    bc.postMessage({ type: EVENT, at: Date.now() });
  } finally {
    bc.close();
  }
}

export function subscribeToCmsUpdates(onUpdate: () => void): () => void {
  const bc = getChannel();
  if (!bc) return () => {};
  const handler = (e: MessageEvent) => {
    if (e.data?.type === EVENT) onUpdate();
  };
  bc.addEventListener("message", handler);
  return () => {
    bc.removeEventListener("message", handler);
    bc.close();
  };
}
