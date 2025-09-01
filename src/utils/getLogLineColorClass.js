export const getLogLineColorClass = (line) => {
  // Colors chosen for good contrast on a dark background for the entire line
  if (line.includes("[ERROR]")) return "text-red-400";
  if (line.includes("[WARN]")) return "text-yellow-300";
  if (line.includes("[DEBUG]")) return "text-purple-400";
  if (line.includes("[INFO]")) return "text-sky-300";
  return "text-slate-300"; // Default for other lines (e.g. Call Stack parts)
};
