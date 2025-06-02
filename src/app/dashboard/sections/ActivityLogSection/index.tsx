// @ts-nocheck

"use client";

import {
  endOfDay,
  format,
  formatDistanceToNow,
  isWithinInterval,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Tag,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../../../components/AppContext";
import { Error, LoadingSpinner } from "../../../../components/lib/utils";
import { getFullUrl } from "../../../../utils/getFullUrl";
import { mockActivityLogs } from "../../mockData/activityLogData"; // Using mock data for now
import type {
  LogEntry,
  ProcessedConversationGroup,
  SectionProps,
} from "../../types";
import LogDetails from "./LogDetails";

const ITEMS_PER_TIMELINE_PAGE = 5;
const CONVERSATION_GROUPS_PER_PAGE = 8;

// Filter interfaces
interface FilterState {
  dateRange:
    | "all"
    | "today"
    | "yesterday"
    | "last7days"
    | "last30days"
    | "custom";
  customStartDate?: string;
  customEndDate?: string;
  actionTypes: string[];
  teams: string[];
  statuses: ("success" | "failure" | "warning" | "info")[];
  tags: string[];
  conversationId: string;
}

const ActivityLogSection: React.FC<SectionProps> = ({ selectedTimePeriod }) => {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [timelineCurrentPages, setTimelineCurrentPages] = useState<{
    [groupId: string]: number;
  }>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: "all",
    actionTypes: [],
    teams: [],
    statuses: [],
    tags: [],
    conversationId: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [activityLogListData, setActivityLogListData] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [isLoadingLogDetails, setIsLoadingLogDetails] = useState(true);
  const [isErrorLogDetails, setErrorLogDetails] = useState(false);
  const [logDetails, setLogDetails] = useState(null);

  const { timePeriod } = useAppContext();

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const actionTypes = new Set<string>();
    const teams = new Set<string>();
    const tags = new Set<string>();

    mockActivityLogs.forEach((log) => {
      actionTypes.add(log.type);

      // Extract teams from various sources
      if (log.details?.targetTeam) teams.add(log.details.targetTeam);
      if (log.sourceComponent) teams.add(log.sourceComponent);

      // Extract tags from conversation topics
      if (log.details?.actionName) tags.add(log.details.actionName);
    });

    return {
      actionTypes: Array.from(actionTypes).sort(),
      teams: Array.from(teams).sort(),
      tags: Array.from(tags).sort(),
    };
  }, []);

  // Apply filters to logs
  const filteredLogs = useMemo(() => {
    let logs = [...mockActivityLogs];

    // Date filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = endOfDay(now);

      switch (filters.dateRange) {
        case "today":
          startDate = startOfDay(now);
          break;
        case "yesterday":
          startDate = startOfDay(subDays(now, 1));
          endDate = endOfDay(subDays(now, 1));
          break;
        case "last7days":
          startDate = startOfDay(subDays(now, 7));
          break;
        case "last30days":
          startDate = startOfDay(subDays(now, 30));
          break;
        case "custom":
          if (filters.customStartDate && filters.customEndDate) {
            startDate = startOfDay(new Date(filters.customStartDate));
            endDate = endOfDay(new Date(filters.customEndDate));
          } else {
            startDate = startOfDay(now);
          }
          break;
        default:
          startDate = startOfDay(now);
      }

      logs = logs.filter((log) => {
        const logDate = parseISO(log.timestamp);
        return isWithinInterval(logDate, { start: startDate, end: endDate });
      });
    }

    // Action type filter
    if (filters.actionTypes.length > 0) {
      logs = logs.filter((log) => filters.actionTypes.includes(log.type));
    }

    // Team filter
    if (filters.teams.length > 0) {
      logs = logs.filter(
        (log) =>
          (log.details?.targetTeam &&
            filters.teams.includes(log.details.targetTeam)) ||
          (log.sourceComponent && filters.teams.includes(log.sourceComponent))
      );
    }

    // Status filter
    if (filters.statuses.length > 0) {
      logs = logs.filter((log) => filters.statuses.includes(log.status));
    }

    // Tags filter
    if (filters.tags.length > 0) {
      logs = logs.filter(
        (log) =>
          log.details?.actionName &&
          filters.tags.includes(log.details.actionName)
      );
    }

    // Conversation ID filter
    if (filters.conversationId.trim()) {
      logs = logs.filter((log) =>
        log.conversationId
          ?.toLowerCase()
          .includes(filters.conversationId.toLowerCase().trim())
      );
    }

    return logs;
  }, [filters]);

  const toggleConversationExpand = (expandedCustomId: string) => {
    setIsLoadingLogDetails(true);
    setExpandedLog((prevId) => {
      const newId = prevId === expandedCustomId ? null : expandedCustomId;
      return newId;
    });
  };

  // Group logs by conversationId and calculate statistics
  const processedConversationGroups: ProcessedConversationGroup[] =
    useMemo(() => {
      const groups: Record<string, LogEntry[]> = {};
      const systemLogsKey = "_system_and_other_events_";

      // Sort all logs initially by timestamp to ensure correct within-group ordering later
      const sortedLogs = [...filteredLogs].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      sortedLogs.forEach((log) => {
        const key = log.conversationId || systemLogsKey;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(log);
      });

      // Calculate stats for each group from 'groups'
      const groupsWithStats = Object.entries(groups).map(
        ([groupId, logsInGroup]) => {
          let successCount = 0;
          let failureCount = 0;
          let warningCount = 0;
          const eventTypeCounts: Record<string, number> = {};

          logsInGroup.forEach((log) => {
            if (log.status === "success") successCount++;
            else if (log.status === "failure") failureCount++;
            else if (log.status === "warning") warningCount++;
            eventTypeCounts[log.type] = (eventTypeCounts[log.type] || 0) + 1;
          });

          let currentTeam = "N/A";
          for (let i = logsInGroup.length - 1; i >= 0; i--) {
            const log = logsInGroup[i];
            if (
              log.details?.targetTeam &&
              typeof log.details.targetTeam === "string"
            ) {
              currentTeam = log.details.targetTeam;
              break;
            }
          }
          if (currentTeam === "N/A" && logsInGroup.length > 0) {
            const lastLog = logsInGroup[logsInGroup.length - 1];
            const knownBotComponents = [
              "IntentRecognitionBot",
              "DomainTransferBot",
              "HandoffBot",
              "KnowledgeBot",
            ];
            if (knownBotComponents.includes(lastLog.sourceComponent)) {
              currentTeam = "AI Support";
            }
          }

          let conversationTopic = "General Inquiry";
          const firstIntentLog = logsInGroup.find(
            (log) => log.type === "intent_recognition"
          );
          if (firstIntentLog) {
            conversationTopic =
              (typeof firstIntentLog.details?.actionName === "string" &&
                firstIntentLog.details.actionName) ||
              firstIntentLog.description ||
              "Intent Recognized";
          } else if (logsInGroup.length > 0 && logsInGroup[0].description) {
            conversationTopic = logsInGroup[0].description;
          }

          return {
            groupId,
            logs: logsInGroup,
            successCount,
            failureCount,
            warningCount,
            eventTypeCounts,
            latestTimestamp:
              logsInGroup.length > 0
                ? logsInGroup[logsInGroup.length - 1].timestamp
                : undefined,
            totalEvents: logsInGroup.length,
            currentTeam,
            conversationTopic,
          };
        }
      );

      // Sort groups by the timestamp of their latest log entry (most recent first)
      return groupsWithStats.sort(
        (
          groupA: ProcessedConversationGroup,
          groupB: ProcessedConversationGroup
        ) => {
          if (groupA.groupId === systemLogsKey) return 1;
          if (groupB.groupId === systemLogsKey) return -1;

          const timeA = groupA.latestTimestamp
            ? parseISO(groupA.latestTimestamp).getTime()
            : 0;
          const timeB = groupB.latestTimestamp
            ? parseISO(groupB.latestTimestamp).getTime()
            : 0;

          if (timeA === 0 && timeB === 0) return 0;
          if (timeA === 0) return 1;
          if (timeB === 0) return -1;

          return timeB - timeA;
        }
      );
    }, [filteredLogs]);

  // Calculate paginated conversation groups
  const totalConversationPages = pagination?.totalPages || 1;
  const currentConversationPage = pagination?.currentPage || 1;
  const paginatedConversationGroups = useMemo(() => {
    const startIndex =
      (currentConversationPage - 1) * CONVERSATION_GROUPS_PER_PAGE;
    const endIndex = startIndex + CONVERSATION_GROUPS_PER_PAGE;
    return processedConversationGroups.slice(startIndex, endIndex);
  }, [processedConversationGroups, currentConversationPage]);

  const activityLogApiPath = process.env.NEXT_PUBLIC_ACTIVITY_LOGS_API_PATH;
  const activityLogDetailApiPath =
    process.env.NEXT_PUBLIC_ACTIVITY_DETAIL_API_PATH;

  const fetchActivityLogList = async (timePeriod: string, page: number) => {
    setIsLoading(true);
    try {
      const endpoint = getFullUrl(
        `${activityLogApiPath}?pageSize=50&period=${timePeriod}&page=${page}`
      );
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const pagination = data?.pagination;
      // Handle the response data here

      setActivityLogListData(data?.activityLogs);
      setPagination(pagination);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activity log list:", error);
      setError(true);
      setIsLoading(false);
    }
  };

  const fetchLogDetails = async (expandedLogVal: string) => {
    const conversationId = expandedLogVal.split("______")[1];
    try {
      const endpoint = getFullUrl(
        `${activityLogDetailApiPath}?conversationId=${conversationId}`
      );
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Handle the response data here

      setLogDetails(data);
      setIsLoadingLogDetails(false);
    } catch (error) {
      console.error("Error fetching activity log list:", error);
      setErrorLogDetails(true);
      setIsLoadingLogDetails(false);
    }
  };

  useEffect(() => {
    fetchActivityLogList(timePeriod, currentConversationPage);
  }, [timePeriod]);

  useEffect(() => {
    if (expandedLog) {
      fetchLogDetails(expandedLog);
    }
  }, [expandedLog]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.dateRange !== "all" ||
    filters.actionTypes.length > 0 ||
    filters.teams.length > 0 ||
    filters.statuses.length > 0 ||
    filters.tags.length > 0 ||
    filters.conversationId.trim() !== "";

  // Handle dropdown toggle
  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".filter-dropdown")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <Error />;
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

      {activityLogListData?.map((logItem: any, index: number) => {
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
                onClick={() => toggleConversationExpand(expandedCustomId!)}
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

export default ActivityLogSection;
