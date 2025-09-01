import { getFullUrl } from "@/utils";


export async function fetchSyncLogUrl(syncId) {
  console.log(`Fetching log URL for sync: ${syncId}`);
  const endpoint = getFullUrl(`/api/syncs/${syncId}/logs`);
  const response = await fetch(endpoint);

  if (!response.ok) {
    console.error(
      `API error when fetching log URL: ${response.status} ${response.statusText}`
    );
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Log URL API response:", data);

  if (!data.signedUrl) {
    console.warn("No signedUrl in response data:", data);
  }

  return data;
}
