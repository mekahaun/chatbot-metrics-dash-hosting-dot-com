import { getEnv } from "@/utils";

const { kbSyncApiPath } = getEnv();

export async function fetchSyncEventDetail(syncId) {
  const response = await fetch(`${kbSyncApiPath}/api/syncs/${syncId}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
