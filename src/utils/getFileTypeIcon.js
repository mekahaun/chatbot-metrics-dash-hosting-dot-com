import { Braces, Code2, FileText, AlignLeft as StreamIcon } from "lucide-react";

export const getFileTypeIcon = (type) => {
  const normalizedType = type ? type.toUpperCase() : "";

  switch (normalizedType) {
    case "HTML":
      return <Code2 className="h-4 w-4 text-orange-500" />;
    case "PDF":
      return <FileText className="h-4 w-4 text-red-500" />;
    case "TXT":
      return <StreamIcon className="h-4 w-4 text-blue-500" />;
    case "JSON":
      return <Braces className="h-4 w-4 text-green-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-400" />;
  }
};
