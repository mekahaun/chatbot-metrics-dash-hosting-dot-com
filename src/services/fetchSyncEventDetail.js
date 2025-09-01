import { getFullUrl } from "@/utils";

export async function fetchSyncEventDetail(syncId) {
  const endpoint = getFullUrl(`/api/syncs/${syncId}`);
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
