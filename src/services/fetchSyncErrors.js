import { getFullUrl } from "@/utils";


export async function fetchSyncErrors(syncId, options = {}) {
  const { pageSize, pageToken } = options;
  let url = `/api/syncs/${syncId}/errors?`;

  const params = new URLSearchParams();
  if (pageSize) params.append("pageSize", pageSize);
  if (pageToken) params.append("pageToken", pageToken);

  const endpoint = getFullUrl(`${url}${params.toString()}`);
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
