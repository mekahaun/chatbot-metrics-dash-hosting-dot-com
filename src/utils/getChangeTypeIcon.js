import {
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  XCircle,
} from "lucide-react";

export const getChangeTypeIcon = (type) => {
  const normalizedType = type ? type.toLowerCase() : "";

  switch (normalizedType) {
    case "created":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "updated":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    case "deleted":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "version_conflict":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-400" />;
  }
};
