"use client";

import { fetchSyncLogUrl } from "@/services";
import { getLogLineColorClass } from "@/utils";
import {
  AlertCircle,
  ExternalLink,
  Loader,
  Search as SearchIconLucide,
} from "lucide-react";
import { useEffect, useState } from "react";

const LogsTab = ({ event, openFullLogModal }) => {
  const [logPreview, setLogPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [triedFetching, setTriedFetching] = useState(false);

  // Use a local cache within the component to avoid re-fetching
  const [logContentCache, setLogContentCache] = useState({});

  useEffect(() => {
    if (!event || !event.syncId || triedFetching) return;

    // Check if log is already in cache
    if (logContentCache[event.syncId]) {
      console.log("Using cached log preview for:", event.syncId);
      setLogPreview(logContentCache[event.syncId]);
      return;
    }

    const fetchLogPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching log preview for syncId:", event.syncId);
        console.log("Event s3LogPath:", event.s3LogPath);

        // Get the signed URL
        const logUrlData = await fetchSyncLogUrl(event.syncId);
        console.log("Log URL data received:", logUrlData);

        if (logUrlData.signedUrl) {
          // Now fetch a preview of the log content
          console.log("Fetching from signed URL:", logUrlData.signedUrl);
          try {
            const response = await fetch(logUrlData.signedUrl);
            if (!response.ok) {
              throw new Error(
                `HTTP error ${response.status}: ${response.statusText}`
              );
            }

            const fullLogText = await response.text();
            console.log("Log text received, length:", fullLogText.length);

            // Only show first 15 lines for preview
            const logLines = fullLogText.split("\n");
            const previewLines = logLines.slice(0, 15);
            let previewText = previewLines.join("\n");

            if (logLines.length > 15) {
              previewText += "\n... (View Full Log for more)";
            }

            setLogPreview(previewText);

            // Cache the log preview
            setLogContentCache((prev) => ({
              ...prev,
              [event.syncId]: previewText,
            }));
          } catch (fetchError) {
            console.error("Error fetching from signed URL:", fetchError);
            setError(
              `Error accessing log file: ${fetchError.message}. You may need to view the full log.`
            );
          }
        } else {
          console.warn("No signed URL in response");
          setError("Log file URL not available in the response");
        }
      } catch (err) {
        console.error("Error fetching log preview:", err);
        setError(`Failed to load log preview: ${err.message}`);
      } finally {
        setLoading(false);
        setTriedFetching(true);
      }
    };

    fetchLogPreview();
  }, [event, triedFetching, logContentCache]);

  // Simplify handling - if we have a syncId, we can show the log viewer
  // even if we're having trouble with preview
  const canViewFullLog = event && event.syncId;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 p-3 border border-gray-200 rounded-t-md bg-gray-50 flex-shrink-0">
        <div className="relative flex-grow mr-2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIconLucide size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search logs in full view..."
            disabled
            className="block w-full p-2 pl-10 text-xs text-gray-900 border border-gray-300 rounded-md bg-white cursor-not-allowed"
          />
        </div>
        <button
          onClick={() => openFullLogModal(event.syncId)}
          disabled={!canViewFullLog}
          className={`px-3 py-2 text-xs font-medium rounded-md flex items-center justify-center whitespace-nowrap ${
            canViewFullLog
              ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ExternalLink size={14} className="mr-1.5" /> View Full Log
        </button>
      </div>

      {/* Log container with dark background */}
      <div className="flex-grow bg-[#1E1E1E] p-3 rounded-b-md shadow-inner text-xs font-mono overflow-y-auto min-h-[200px] max-h-[calc(90vh-400px)] border border-t-0 border-gray-700 relative">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader size={24} className="animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">Loading log preview...</span>
          </div>
        ) : error ? (
          <div className="text-yellow-400 p-3 flex items-start">
            <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              {canViewFullLog && (
                <p className="mt-2">
                  {`Try clicking "View Full Log" to see the complete log file.`}
                </p>
              )}
            </div>
          </div>
        ) : logPreview ? (
          logPreview.split("\n").map((line, index) => (
            <div
              key={index}
              className={`whitespace-pre-wrap select-text ${getLogLineColorClass(
                line
              )}`}
            >
              {line}
            </div>
          ))
        ) : canViewFullLog ? (
          <div className="text-gray-500 p-3">
            <p>
              {`Preview not available. Click "View Full Log" to see the complete log file.`}
            </p>
          </div>
        ) : (
          <div className="text-gray-500 p-3">No log entries available.</div>
        )}
      </div>
    </div>
  );
};

export default LogsTab;
