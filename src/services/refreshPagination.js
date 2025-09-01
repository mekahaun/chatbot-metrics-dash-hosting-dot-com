import { getFullUrl } from "@/utils";


export async function refreshPagination() {
  const endpoint = getFullUrl("/api/pagination/refresh");
  const response = await fetch(endpoint, {
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
