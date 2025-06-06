"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Tag,
  Users,
  X,
} from "lucide-react";

import { useAppContext } from "@/components/context/AppContext";
import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";
import LogDetails from "./LogDetails";
import { useActivityLogs } from './useActivityLogs';

const ActivityLog = () => {
  const { timePeriod } = useAppContext();
  const {
    // State
    expandedLog,
    openDropdown,
    setOpenDropdown,
    filters,
    setFilters,
    isLoading,
    isError,
    activityLogListData,
    pagination,
    isLoadingLogDetails,
    isErrorLogDetails,
    logDetails,

    // Computed values
    totalConversationPages,
    currentConversationPage,
    hasActiveFilters,
    filterOptions,

    // Event handlers
    toggleConversationExpand,
    toggleDropdown,
    handleClearFilters,

    // Data fetching
    fetchActivityLogList,
    fetchLogDetails,
  } = useActivityLogs(timePeriod);

  if (isLoading) {
    return <LoadingSection />;
  }

  if (isError) {
    return <ErrorSection />;
  }

  return (
    <div className="space-y-3">
      {/* Filters - Always Visible */}
      <div className="bg-transparent p-0 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date Range Filter - Dropdown with Custom Option */}
          {/* <div className="relative filter-dropdown">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => {
                const value = e.target.value as any;
                setFilters((prev) => ({ ...prev, dateRange: value }));
                if (value === "custom") {
                  setOpenDropdown("dateRange");
                } else {
                  setOpenDropdown(null);
                }
              }}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range...</option>
            </select>
            {filters.dateRange === "custom" && openDropdown === "dateRange" && (
              <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.customStartDate || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        customStartDate: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    placeholder="Start date"
                  />
                  <input
                    type="date"
                    value={filters.customEndDate || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        customEndDate: e.target.value,
                      }))
                    }
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    placeholder="End date"
                  />
                  <button
                    onClick={() => setOpenDropdown(null)}
                    className="w-full px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Apply Date Range
                  </button>
                </div>
              </div>
            )}
          </div> */}

          {/* Status Filter - Multiselect Dropdown */}
          {/* <div className="relative filter-dropdown">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-3 py-1.5 text-xs text-left bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                onClick={() => toggleDropdown("status")}
              >
                <span>
                  {filters.statuses.length === 0
                    ? "All Statuses"
                    : `${filters.statuses.length} selected`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {openDropdown === "status" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-auto">
                  {["success", "failure", "warning", "info"].map((status) => (
                    <label
                      key={status}
                      className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters((prev) => ({
                              ...prev,
                              statuses: [...prev.statuses, status as any],
                            }));
                          } else {
                            setFilters((prev) => ({
                              ...prev,
                              statuses: prev.statuses.filter(
                                (s) => s !== status
                              ),
                            }));
                          }
                        }}
                        className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700 flex items-center gap-1">
                        {status === "success" && (
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                        )}
                        {status === "failure" && (
                          <XCircle className="w-3 h-3 text-red-500" />
                        )}
                        {status === "warning" && (
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        )}
                        {status === "info" && (
                          <Info className="w-3 h-3 text-blue-500" />
                        )}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div> */}

          {/* Action Types Filter - Multiselect Dropdown */}
          {/* <div className="relative filter-dropdown">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Action Types
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-3 py-1.5 text-xs text-left bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                onClick={() => toggleDropdown("actionTypes")}
              >
                <span className="truncate">
                  {filters.actionTypes.length === 0
                    ? "All Action Types"
                    : filters.actionTypes.length === 1
                    ? filters.actionTypes[0].replace(/_/g, " ")
                    : `${filters.actionTypes.length} selected`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {openDropdown === "actionTypes" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-auto">
                  {filterOptions.actionTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.actionTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters((prev) => ({
                              ...prev,
                              actionTypes: [...prev.actionTypes, type],
                            }));
                          } else {
                            setFilters((prev) => ({
                              ...prev,
                              actionTypes: prev.actionTypes.filter(
                                (t) => t !== type
                              ),
                            }));
                          }
                        }}
                        className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700">
                        {type.replace(/_/g, " ")}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div> */}

          {/* Teams Filter - Multiselect Dropdown */}
          {/* <div className="relative filter-dropdown">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Teams/Components
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full px-3 py-1.5 text-xs text-left bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                onClick={() => toggleDropdown("teams")}
              >
                <span className="truncate">
                  {filters.teams.length === 0
                    ? "All Teams"
                    : filters.teams.length === 1
                    ? filters.teams[0]
                    : `${filters.teams.length} selected`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {openDropdown === "teams" && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-auto">
                  {filterOptions.teams.map((team) => (
                    <label
                      key={team}
                      className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.teams.includes(team)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters((prev) => ({
                              ...prev,
                              teams: [...prev.teams, team],
                            }));
                          } else {
                            setFilters((prev) => ({
                              ...prev,
                              teams: prev.teams.filter((t) => t !== team),
                            }));
                          }
                        }}
                        className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700">{team}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div> */}
        </div>

        {/* Second Row - Search and Clear */}
        <div className="flex items-center gap-3 mt-0">
          {/* Conversation ID Search */}
          {/* <div className="flex-1 max-w-sm">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={filters.conversationId}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    conversationId: e.target.value,
                  }))
                }
                placeholder="Search by conversation ID..."
                className="pl-8 pr-3 py-1.5 w-full text-xs border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div> */}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-5">
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <X className="w-3.5 h-3.5" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* {paginatedConversationGroups.length === 0 &&
        processedConversationGroups.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">
              No activity logs on this page. Try another page.
            </p>
          </div>
        )}
      {processedConversationGroups.length === 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">
            {hasActiveFilters
              ? "No activity logs match the selected filters. Try adjusting your filter criteria."
              : "No activity logs to display."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() =>
                setFilters({
                  dateRange: "all",
                  actionTypes: [],
                  teams: [],
                  statuses: [],
                  tags: [],
                  conversationId: "",
                })
              }
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      )} */}

      {activityLogListData?.map((logItem, index) => {
        const {
          timestamp,
          conversationId,
          agentOrComponent,
          actionTitle,
          eventId,
          statusIndicator,
          teamAssigned,
          conversationOverallStatus,
        } = logItem;

        const expandedCustomId = `${eventId}______${conversationId}`;

        const isExpanded = expandedLog === expandedCustomId;

        return (
          <div key={eventId} className="flex items-start group py-1.5">
            {/* Content Card (Right Side - Expandable) */}
            <div
              className={`bg-white rounded-md shadow-sm w-full overflow-hidden ${
                isExpanded
                  ? "ring-1 ring-blue-500 shadow-md"
                  : "group-hover:shadow-md"
              }`}
            >
              {" "}
              {/* Removed ml-0 */}
              {/* Conversation Header - Clickable to expand/collapse - SINGLE ROW */}
              <div
                onClick={() => toggleConversationExpand(expandedCustomId)}
                className={`p-2.5 cursor-pointer flex items-center w-full whitespace-nowrap ${
                  isExpanded
                    ? "border-b border-gray-200 bg-gray-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col justify-between w-full">
                  {/* Group ID, Topic, and Team - combined and truncated */}
                  <div className="flex items-center w-full">
                    <div className="flex items-center flex-shrink min-w-0 max-w-[700px] mr-2">
                      <h3 className="text-sm font-medium text-gray-800 truncate max-w-[400px]">
                        {conversationId} - {actionTitle}
                      </h3>
                      {agentOrComponent && (
                        <span className="flex items-center text-xs text-gray-500 ml-1.5 truncate">
                          <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="w-fit">{agentOrComponent}</span>
                        </span>
                      )}
                    </div>
                    {teamAssigned && teamAssigned !== "N/A" && (
                      <div
                        className="flex items-center text-xs text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded-full mr-2 flex-shrink-0 max-w-[300px] truncate"
                        title={`Current Team: ${teamAssigned}`}
                      >
                        <Users className="w-fit h-3.5 mr-1 flex-shrink-0" />
                        <span className="w-fit">{teamAssigned}</span>
                      </div>
                    )}
                  </div>
                  <div className="">
                    {/* Timestamp Area (Last Updated At) */}
                    <div className="w-32 pr-3 pt-1.5 flex-shrink-0 self-center">
                      {timestamp && (
                        <div className="flex items-center">
                          <p
                            className="text-xs text-gray-500 whitespace-nowrap pr-2"
                            title={format(parseISO(timestamp), "PPpp EEEE")}
                          >
                            {format(parseISO(timestamp), "HH:mm:ss")}
                          </p>
                          <p className="text-xs text-gray-400 whitespace-nowrap border-l border-gray-200 pl-2">
                            {formatDistanceToNow(parseISO(timestamp), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" /> /* Reduced ml */
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
                  ) /* Reduced ml */
                }
              </div>
              {/* Expanded Content Area - Two Columns */}
              {isExpanded && (
                <LogDetails
                  isLoading={isLoadingLogDetails}
                  isError={isErrorLogDetails}
                  logDetails={logDetails}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Pagination for Conversation Groups List */}
      {totalConversationPages > 1 && (
        <div className="flex justify-center items-center mt-4 pt-2 border-t border-gray-200 space-x-2">
          <button
            onClick={() =>
              fetchActivityLogList(timePeriod, currentConversationPage - 1)
            }
            disabled={currentConversationPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          <span className="text-sm text-gray-700 px-2">
            Page {currentConversationPage} of {totalConversationPages}
          </span>
          <button
            onClick={() =>
              fetchActivityLogList(timePeriod, currentConversationPage + 1)
            }
            disabled={currentConversationPage === totalConversationPages}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
