import { getFullUrl } from "@/utils";

export async function fetchNextScheduledSync() {
  const endpoint = getFullUrl("/api/next-sync");
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
