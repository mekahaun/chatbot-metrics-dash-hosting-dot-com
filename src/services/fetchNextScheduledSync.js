import { getEnv } from "@/utils";

const { kbSyncApiPath } = getEnv();

export async function fetchNextScheduledSync() {
  const response = await fetch(`${kbSyncApiPath}/api/next-sync`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
