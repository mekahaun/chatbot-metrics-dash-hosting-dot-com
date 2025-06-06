import { getEnv } from "@/utils";

const { kbSyncApiPath } = getEnv();

export async function triggerSync() {
  const response = await fetch(`${kbSyncApiPath}/api/trigger-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
