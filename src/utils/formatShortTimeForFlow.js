export const formatShortTimeForFlow = (timestamp) => {
  const then = new Date(timestamp);
  return then.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
