import { getFullUrl } from "@/utils";


export async function fetchSyncEvents(options = {}) {
  const { pageSize, pageToken, status } = options;
  let url = `/api/syncs?`;

  const params = new URLSearchParams();
  if (pageSize) params.append("pageSize", pageSize);
  if (pageToken) params.append("pageToken", pageToken);
  if (status) params.append("status", status);

  const endpoint = getFullUrl(`${url}${params.toString()}`);
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
