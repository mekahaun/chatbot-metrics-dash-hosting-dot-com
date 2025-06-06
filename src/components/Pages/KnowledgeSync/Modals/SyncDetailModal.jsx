// app/sync/components/modals/SyncDetailModal.jsx
"use client";

import {
  Activity,
  AlertOctagon,
  Archive as ArchiveIcon,
  Calendar,
  Clock,
  FileDiff,
  FileTerminal,
  ListChecks,
  Loader,
  Repeat,
  X,
} from "lucide-react";
import React from "react";
import { formatDuration, formatTimestamp, getStatusStyles } from "@/utils";

import ChangesTab from "./Tabs/ChangesTab";
import ErrorsTab from "./Tabs/ErrorsTab";
import FilesTab from "./Tabs/FilesTab";
import LogsTab from "./Tabs/LogsTab";
import OverviewTab from "./Tabs/OverviewTab";

// Tabs configuration array
const getTabs = (event) => [
  { name: "Overview", icon: <ListChecks size={16} /> },
  { name: "Changes", icon: <FileDiff size={16} /> },
  {
    name: "Errors",
    icon: <AlertOctagon size={16} />,
    count: event?.errors?.length || 0,
  },
  { name: "Logs", icon: <FileTerminal size={16} /> },
  // Only show Files tab if intermediateFiles is defined - we'll handle empty array in the tab content
  ...(event && event.hasOwnProperty("intermediateFiles")
    ? [{ name: "Files", icon: <ArchiveIcon size={16} /> }]
    : []),
];

const SyncDetailModal = ({
  event,
  onClose,
  openContentViewModal,
  openDiffModal,
  openFullLogModal,
  activeTabProp,
  setActiveTabProp,
  isLoading = false,
}) => {
  // Remove local state and use only prop value
  const activeTab = activeTabProp || "Overview";

  // Get status styles
  const status = event?.status || "unknown";
  const { badgeColor, iconColor, icon } = getStatusStyles(status);

  // Get tabs list based on event data
  const tabs = React.useMemo(() => getTabs(event), [event]);

  // Stop propagation on modal content clicks
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className="modal-content bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
        onClick={handleModalContentClick}
      >
        {/* Header with close button */}
        <div className="border-b border-gray-200">
          <div className="p-4 sm:p-6 flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Sync Event Details
                </h3>
                {event && (
                  <div
                    className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={iconColor}>{icon}</span>
                      <span className="capitalize">{status}</span>
                    </div>
                  </div>
                )}
              </div>
              {event && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center">
                    ID:{" "}
                    <span title={event.syncId} className="font-mono ml-1">
                      {event.syncId}
                    </span>
                  </p>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1.5" />
                      {formatTimestamp(event.startTime)}
                    </div>
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1.5" />
                      {formatDuration(event.startTime, event.endTime)}
                    </div>
                    {event.triggerType && (
                      <div className="flex items-center">
                        <Repeat size={12} className="mr-1.5" />
                        <span className="capitalize">
                          {event.triggerType} Trigger
                        </span>
                      </div>
                    )}
                    {event.counts && (
                      <div className="flex items-center">
                        <Activity size={12} className="mr-1.5" />
                        <span>
                          {event.counts.pagesCreated} created,{" "}
                          {event.counts.pagesUpdated} updated,{" "}
                          {event.counts.pagesDeleted} deleted
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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

          {/* Tabs */}
          <div className="flex border-t border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTabProp(tab.name)}
                className={`py-3 px-5 text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === tab.name
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab.name
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader size={36} className="animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading details...</span>
            </div>
          ) : !event ? (
            <div className="text-center text-gray-500 py-8">
              No data available for this sync event.
            </div>
          ) : (
            <div>
              {activeTab === "Overview" && <OverviewTab event={event} />}
              {activeTab === "Changes" && (
                <ChangesTab
                  event={event}
                  openContentViewModal={openContentViewModal}
                  openDiffModal={openDiffModal}
                />
              )}
              {activeTab === "Errors" && (
                <ErrorsTab errors={event.errors} event={event} />
              )}
              {activeTab === "Logs" && (
                <LogsTab event={event} openFullLogModal={openFullLogModal} />
              )}
              {activeTab === "Files" && (
                <FilesTab
                  event={event}
                  openContentViewModal={openContentViewModal}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncDetailModal;
