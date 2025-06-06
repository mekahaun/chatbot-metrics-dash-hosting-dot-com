import { getEnv } from "@/utils";

const { kbSyncApiPath } = getEnv();

export async function fetchSyncEvents(options = {}) {
  const { pageSize, pageToken, status } = options;
  let url = `${kbSyncApiPath}/api/syncs?`;

  const params = new URLSearchParams();
  if (pageSize) params.append("pageSize", pageSize);
  if (pageToken) params.append("pageToken", pageToken);
  if (status) params.append("status", status);

  const response = await fetch(`${url}${params.toString()}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
