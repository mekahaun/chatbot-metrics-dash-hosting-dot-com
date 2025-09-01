export const formatDuration = (start, end) => {
  if (!start) return "N/A";
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : new Date().getTime();

  const durationMs = endTime - startTime;

  if (durationMs < 0 && end) return "Invalid";

  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor(durationMs / (1000 * 60 * 60));

  let str = "";
  if (hours > 0) str += `${hours}h `;
  if (minutes > 0) str += `${minutes}m `;
  str += `${seconds}s`;

  const durationString = str.trim() || "0s";

  return end ? durationString : `${durationString} (Running)`;
};
