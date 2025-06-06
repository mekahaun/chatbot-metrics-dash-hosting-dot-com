import { getEnv } from "@/utils";

const { kbSyncApiPath } = getEnv();

export async function fetchSyncErrors(syncId, options = {}) {
  const { pageSize, pageToken } = options;
  let url = `${kbSyncApiPath}/api/syncs/${syncId}/errors?`;

  const params = new URLSearchParams();
  if (pageSize) params.append("pageSize", pageSize);
  if (pageToken) params.append("pageToken", pageToken);

  const response = await fetch(`${url}${params.toString()}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
