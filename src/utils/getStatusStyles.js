import {
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw as RunningIcon,
  XCircle,
} from "lucide-react";

export const getStatusStyles = (status) => {
  const normalizedStatus = status ? status.toLowerCase() : "";

  switch (normalizedStatus) {
    case "completed":
      return {
        icon: <CheckCircle />,
        badgeColor: "bg-green-100 text-green-700",
        iconColor: "text-green-500",
      };
    case "failed":
      return {
        icon: <XCircle />,
        badgeColor: "bg-red-100 text-red-700",
        iconColor: "text-red-500",
      };
    case "partially completed":
    case "partially_completed":
      return {
        icon: <AlertCircle />,
        badgeColor: "bg-yellow-100 text-yellow-700",
        iconColor: "text-yellow-500",
      };
    case "running":
      return {
        icon: <RunningIcon className="animate-spin" />,
        badgeColor: "bg-blue-100 text-blue-700",
        iconColor: "text-blue-500",
      };
    default:
      return {
        icon: <Info />,
        badgeColor: "bg-gray-100 text-gray-700",
        iconColor: "text-gray-500",
      };
  }
};
