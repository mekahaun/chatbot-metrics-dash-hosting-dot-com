import React from "react";
import ReactMarkdown from "react-markdown";

const DetailItem = ({
  label,
  value,
  icon,
  code = false,
  fullWidth = false,
  children,
  markdown = false,
}) => (
  <div className={`py-2 ${fullWidth ? "col-span-2" : ""}`}>
    <dt className="text-sm font-medium text-gray-500 mb-0.5 flex items-center">
      {icon &&
        React.cloneElement(icon, { className: "h-4 w-4 mr-2 text-gray-400" })}
      {label}
    </dt>
    {children ? (
      <dd className="mt-1 text-sm text-gray-900 prose prose-sm max-w-none">
        {children}
      </dd>
    ) : markdown ? (
      <dd className="mt-1 text-sm text-gray-900 prose prose-sm max-w-none">
        <ReactMarkdown>{value || "N/A"}</ReactMarkdown>
      </dd>
    ) : code ? (
      <dd className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded font-mono overflow-x-auto border border-gray-200">
        {value || "N/A"}
      </dd>
    ) : (
      <dd className="mt-1 text-sm text-gray-900">{value || "N/A"}</dd>
    )}
  </div>
);

export default DetailItem;
