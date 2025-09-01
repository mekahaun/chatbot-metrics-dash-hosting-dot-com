import { getRoutes, getFullUrl } from "@/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";

const useOverviewV2 = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [dateRange, setDateRange] = useState("L7D");
  
  // Chart data states
  const [conversationVolumeData, setConversationVolumeData] = useState([]);
  const [handoffReasonsData, setHandoffReasonsData] = useState([]);
  const [routingAccuracyData, setRoutingAccuracyData] = useState([]);
  
  // Table data states
  const [dailyPerformanceData, setDailyPerformanceData] = useState([]);
  const [dailyPerformancePagination, setDailyPerformancePagination] = useState(null);
  
  // Overall metrics
  const [overallMetrics, setOverallMetrics] = useState({
    aiResolutionRate: null,
    totalConversations: null,
    handoffAccuracy: null,
  });

  const totalPages = dailyPerformancePagination?.totalPages || 1;
  const currentPage = dailyPerformancePagination?.currentPage || 1;

  const { overviewV2ApiPath, dailyPerformanceApiPath } = getRoutes();

  // Main data fetching function
  const fetchData = async (period = dateRange, page = 1) => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      // Fetch main overview data
      const endpoint = getFullUrl(
        `${overviewV2ApiPath || '/api/overview-v2'}?period=${period}&dailyPage=${page}`
      );
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Process conversation volume data
      if (data?.conversationVolumeTrend) {
        const volumeData = data.conversationVolumeTrend.map(item => ({
          date: item.date,
          total: item.totalConversations || 0,
          aiResolved: item.aiResolved || 0,
          humanAssisted: item.humanAssisted || 0,
          stillPending: item.stillPending || 0,
        }));
        setConversationVolumeData(volumeData);
      }

      // Process handoff reasons data
      if (data?.topHandoffReasons) {
        const reasonsData = data.topHandoffReasons
          .map((item) => ({
            name: item.reason,
            reason: item.reason.toLowerCase().replace(/ /g, '_'),
            value: item.count,
            percentage: item.percentage,
          }))
          .slice(0, 8); // Top 8 reasons
        setHandoffReasonsData(reasonsData);
      }

      // Process routing accuracy data
      if (data?.routingAccuracy) {
        const accuracyData = data.routingAccuracy.map(item => ({
          team: item.team,
          correct: item.correctly_routed || 0,
          incorrect: item.reassigned_incorrect || 0,
          total: item.total || 0,
          accuracy: parseFloat(item.accuracy) || 0,
        }));
        setRoutingAccuracyData(accuracyData);
      }

      // Process daily performance data
      if (data?.dailyPerformanceSummary?.data) {
        const processedDailyData = data.dailyPerformanceSummary.data.map((day) => ({
          ...day,
          date: day?.date && format(new Date(day.date), "MMM dd, yyyy"),
          totalConversations: {
            value: day.totalConversations || 0,
          },
          humanHandoffs: {
            value: day.humanHandoffs || 0,
          },
          handoffRate: {
            value: day.totalConversations > 0
              ? `${((day.humanHandoffs / day.totalConversations) * 100).toFixed(1)}%`
              : "0%",
          },
          aiResolutionRate: {
            value: "N/A", // This would need to be calculated from resolved conversations
          },
          routingAccuracy: {
            value: day.handoffAccuracy || "N/A",
          },
        }));
        setDailyPerformanceData(processedDailyData);
        setDailyPerformancePagination(data.dailyPerformanceSummary.pagination);
      }

      // Set overall metrics
      if (data?.overallMetrics) {
        setOverallMetrics({
          aiResolutionRate: data.overallMetrics.aiResolutionRate || { value: "0%", subtitle: "No data" },
          totalConversations: data.overallMetrics.totalConversations || { value: 0, subtitle: "No data" },
          handoffAccuracy: data.overallMetrics.handoffAccuracy || { value: "0%", subtitle: "No data" },
        });
      }

    } catch (error) {
      console.error("Error fetching overview V2 data:", error);
      setIsError(true);
      
      // Set default empty data on error
      setConversationVolumeData([]);
      setHandoffReasonsData([]);
      setRoutingAccuracyData([]);
      setDailyPerformanceData([]);
      setOverallMetrics({
        aiResolutionRate: { value: "0%", subtitle: "Error loading data" },
        totalConversations: { value: 0, subtitle: "Error loading data" },
        handoffAccuracy: { value: "0%", subtitle: "Error loading data" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch daily performance data for pagination
  const fetchDailyPerformanceData = async (period = dateRange, page) => {
    try {
      const endpoint = getFullUrl(
        `${dailyPerformanceApiPath || '/api/daily-performance'}?period=${period}&page=${page}`
      );
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data?.data) {
        const processedDailyData = data.data.map((day) => ({
          ...day,
          date: day?.date && format(new Date(day.date), "MMM dd, yyyy"),
          totalConversations: {
            value: day.totalConversations || 0,
          },
          humanHandoffs: {
            value: day.humanHandoffs || 0,
          },
          handoffRate: {
            value: day.totalConversations > 0
              ? `${((day.humanHandoffs / day.totalConversations) * 100).toFixed(1)}%`
              : "0%",
          },
          aiResolutionRate: {
            value: "N/A", // This would need to be calculated from resolved conversations
          },
          routingAccuracy: {
            value: day.handoffAccuracy || "N/A",
          },
        }));
        setDailyPerformanceData(processedDailyData);
        setDailyPerformancePagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching daily performance data:", error);
    }
  };

  // Format handoff reason for display
  // const formatHandoffReason = (reason) => {
  //   if (!reason) return "Other";
  //   return reason
  //     .split("_")
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(" ");
  // };

  // Refresh data
  const refreshData = () => {
    fetchData(dateRange, currentPage);
  };

  // Initial data fetch
  useEffect(() => {
    fetchData(dateRange, 1);
  }, [dateRange]);

  return {
    isLoading,
    isError,
    conversationVolumeData,
    handoffReasonsData,
    routingAccuracyData,
    dailyPerformanceData,
    overallMetrics,
    dateRange,
    setDateRange,
    totalPages,
    currentPage,
    fetchData,
    fetchDailyPerformanceData,
    refreshData,
  };
};

export default useOverviewV2;