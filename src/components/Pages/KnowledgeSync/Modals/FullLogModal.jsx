"use client";

import { getLogLineColorClass } from "@/utils";
import {
  AlertCircle,
  Download,
  Loader,
  Search as SearchIconLucide,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const FullLogModal = ({
  logContent,
  searchTerm: initialSearchTerm,
  setSearchTerm: setParentSearchTerm,
  logRef,
  onClose,
  isLoading = false,
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState(
    initialSearchTerm || ""
  );
  const [filteredLines, setFilteredLines] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // First check if logContent contains an error message
    if (
      logContent &&
      typeof logContent === "string" &&
      logContent.startsWith("Error")
    ) {
      setErrorMessage(logContent);
      setFilteredLines([]);
    } else {
      // Only split if logContent is a non-empty string
      const lines =
        typeof logContent === "string" && logContent
          ? logContent.split("\n")
          : [];

      setFilteredLines(
        lines.filter((line) =>
          line.toLowerCase().includes(internalSearchTerm.toLowerCase())
        )
      );
      setErrorMessage(null);
    }
  }, [logContent, internalSearchTerm]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = 0;
    }
  }, [logContent, logRef]);

  // Stop propagation on modal content clicks
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  const handleSearchChange = (e) => {
    setInternalSearchTerm(e.target.value);
    if (setParentSearchTerm) setParentSearchTerm(e.target.value);
  };

  const handleDownload = () => {
    if (!logContent || typeof logContent !== "string" || errorMessage) {
      alert("No log content available to download");
      return;
    }

    const blob = new Blob([logContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sync-log-${new Date().toISOString().split("T")[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasContent =
    logContent && typeof logContent === "string" && logContent.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div
        className="modal-content bg-white rounded-lg shadow-xl max-w-7xl w-full overflow-hidden"
        onClick={handleModalContentClick}
      >
        {/* Header with title and close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Full Sync Log</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3 sm:p-4 flex flex-col h-[calc(90vh-80px)]">
          <div className="flex items-center space-x-2 mb-3 flex-shrink-0">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIconLucide size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search full log..."
                value={internalSearchTerm}
                onChange={handleSearchChange}
                className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading || !hasContent || !!errorMessage}
              />
            </div>
            <button
              onClick={handleDownload}
              disabled={isLoading || !hasContent || !!errorMessage}
              className={`px-3 py-2.5 text-white text-xs font-medium rounded-lg flex items-center flex-shrink-0 ${
                isLoading || !hasContent || !!errorMessage
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Download size={14} className="mr-1.5" /> Download Raw
            </button>
          </div>

          <div
            ref={logRef}
            className="bg-[#1E1E1E] p-4 rounded-md shadow-inner text-xs flex-grow overflow-y-auto font-mono relative"
          >
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-full text-gray-400">
                <Loader size={36} className="animate-spin mb-2" />
                <p>Loading log content...</p>
              </div>
            ) : errorMessage ? (
              <div className="text-yellow-400 p-3 flex items-start">
                <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{errorMessage}</p>
                  <p className="mt-2">
                    This may be due to CORS issues with the S3 bucket or the log
                    file not being available.
                  </p>
                </div>
              </div>
            ) : filteredLines.length > 0 ? (
              filteredLines.map((line, index) => (
                <div
                  key={index}
                  className={`whitespace-pre-wrap select-text ${getLogLineColorClass(
                    line
                  )}`}
                >
                  {line}
                </div>
              ))
            ) : (
              <div className="text-gray-500">
                {hasContent
                  ? "No log entries match your search."
                  : "No log content available."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullLogModal;
