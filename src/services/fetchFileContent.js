import { getFullUrl } from "@/utils";

export async function fetchFileContent(s3Path) {
  if (!s3Path) {
    throw new Error("S3 path is required");
  }

  const endpoint = getFullUrl(`/api/files?path=${encodeURIComponent(s3Path)}`);
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.signedUrl) {
    throw new Error("No signed URL returned from API");
  }

  // Now fetch the actual file content using the signed URL
  const contentResponse = await fetch(data.signedUrl);
  if (!contentResponse.ok) {
    throw new Error(
      `File fetch error: ${contentResponse.status} ${contentResponse.statusText}`
    );
  }

  const fileType = s3Path.toLowerCase();
  if (fileType.endsWith(".json")) {
    return await contentResponse.json();
  } else {
    return await contentResponse.text();
  }
}
