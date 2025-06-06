import { getEnv } from "@/utils";

const { kbSyncApiPath } = getEnv();

export async function fetchSyncEventsByPage(pageNumber, options = {}) {
  const { pageSize, status } = options;
  let url = `${kbSyncApiPath}/api/syncs/page/${pageNumber}?`;

  const params = new URLSearchParams();
  if (pageSize) params.append("pageSize", pageSize);
  if (status) params.append("status", status);

  const response = await fetch(`${url}${params.toString()}`);
  if (!response.ok) {
    console.error(
      `API error when fetching sync events page ${pageNumber}: ${response.status} ${response.statusText}`
    );
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(
    `Fetched ${data.syncs?.length || 0} events for page ${pageNumber}`
  );
  return data;
}
