import { getFullUrl, getRoutes } from "@/utils";
import { useEffect, useState } from "react";

export const useActivityLogs = (timePeriod) => {
  // UI State
  const [expandedLog, setExpandedLog] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    dateRange: "all",
    actionTypes: [],
    teams: [],
    statuses: [],
    tags: [],
    conversationId: "",
  });

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [activityLogListData, setActivityLogListData] = useState([]);
  const [pagination, setPagination] = useState(null);

  // Log details state
  const [isLoadingLogDetails, setIsLoadingLogDetails] = useState(true);
  const [isErrorLogDetails, setErrorLogDetails] = useState(false);
  const [logDetails, setLogDetails] = useState(null);

  const { activityLogsApiPath, activityDetailApiPath } = getRoutes();

  // Computed values
  const totalConversationPages = pagination?.totalPages || 1;
  const currentConversationPage = pagination?.currentPage || 1;

  const hasActiveFilters =
    filters.dateRange !== "all" ||
    filters.actionTypes.length > 0 ||
    filters.teams.length > 0 ||
    filters.statuses.length > 0 ||
    filters.tags.length > 0 ||
    filters.conversationId.trim() !== "";

  // Event handlers
  const toggleConversationExpand = (expandedCustomId) => {
    setIsLoadingLogDetails(true);
    setExpandedLog((prevId) => {
      const newId = prevId === expandedCustomId ? null : expandedCustomId;
      return newId;
    });
  };

  // Data fetching functions
  const fetchActivityLogList = async (timePeriod, page) => {
    setIsLoading(true);
    try {
      const endpoint = getFullUrl(
        `${activityLogsApiPath}?pageSize=50&period=${timePeriod}&page=${page}`
      );
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const pagination = data?.pagination;

      setActivityLogListData(data?.activityLogs);
      setPagination(pagination);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activity log list:", error);
      setError(true);
      setIsLoading(false);
    }
  };

  const fetchLogDetails = async (expandedLogVal, accountId = 2) => {
    const conversationId = expandedLogVal.split("______")[1];
    try {
      const endpoint = getFullUrl(
        `${activityDetailApiPath}?conversationId=${conversationId}&accountId=${accountId || 2}`
      );
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod]);

  useEffect(() => {
    if (expandedLog) {
      fetchLogDetails(expandedLog);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedLog]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest(".filter-dropdown")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return {
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

    // Event handlers
    toggleConversationExpand,

    // Data fetching
    fetchActivityLogList,
    fetchLogDetails,
  };
};
