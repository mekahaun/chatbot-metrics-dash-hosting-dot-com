export const formatExactTimestamp = (timestamp) => {
  const then = new Date(timestamp);
  return then.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
