import { useAppContext } from "@/components/context/AppContext";
import {getEnv, getFullUrl} from "@/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";

const useOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [isDailyPerformanceLoading, setIsDailyPerformanceLoading] =
    useState(false);
  const [isDailyPerformanceError, setIsDailyPerformanceError] = useState(false);

  const [conversationVolumeChartData, setConversationVolumeChartData] =
    useState([]);
  const [aiPerformanceChartData, setAiPerformanceChartData] = useState([]);
  const [dailyPerformanceData, setDailyPerformanceData] = useState([]);
  const [dailyPerformancePagination, setDailyPerformancePagination] =
    useState(null);
  const [overallMetricsData, setOverallMetricsData] = useState({
    actionSuccessRate: null,
    aiResolutionRate: null,
    handoffAccuracy: null,
    totalConversations: null,
  });

  const { timePeriod } = useAppContext();

  const actionSuccessRate = overallMetricsData?.actionSuccessRate;
  const aiResolutionRate = overallMetricsData?.aiResolutionRate;
  const handoffAccuracy = overallMetricsData?.handoffAccuracy;
  const totalConversations = overallMetricsData?.totalConversations;

  const totalPages = dailyPerformancePagination?.totalPages || 1;
  const currentPage = dailyPerformancePagination?.currentPage || 1;

  const metricTooltips = {
    aiResolutionRate:
      "Percentage of conversations fully resolved by AI without human intervention.",
    totalConversations:
      "Total number of unique conversations handled by the system",
    actionSuccessRate: "Percentage of Success rate of AI responses and actions",
    handoffAccuracy:
      "Accuracy of AI in determining when to hand off conversations to human agents.",
  };

  const { overviewApiPath } = getEnv();

  const fetchOverviewData = async (timePeriod, page) => {
    setIsLoading(true);
    try {
      const endpoint = getFullUrl(
        `${overviewApiPath}?period=${timePeriod}&page=${page}`
      );
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const conversationVolumeChartData = data?.charts?.conversationVolume;
      const aiPerformanceChartData = data?.charts?.aiPerformance;

      const overallMetrics = data?.overallMetrics;
      const actionSuccessRate = overallMetrics?.actionSuccessRate;
      const aiResolutionRate = overallMetrics?.aiResolutionRate;
      const handoffAccuracy = overallMetrics?.handoffAccuracy;
      const totalConversations = overallMetrics?.totalConversations;
      const dailyPerformance = data?.dailyPerformanceSummary?.data;
      const dailyPerformancePagination =
        data?.dailyPerformanceSummary?.pagination;

      const processedDailyPerformance = dailyPerformance?.map((day) => {
        return {
          ...day,
          date: day?.date && format(new Date(day?.date), "MMM dd, yyyy"),
        };
      });

      setConversationVolumeChartData(conversationVolumeChartData);
      setAiPerformanceChartData(aiPerformanceChartData);
      setDailyPerformanceData(processedDailyPerformance);
      setDailyPerformancePagination(dailyPerformancePagination);
      setOverallMetricsData({
        actionSuccessRate,
        aiResolutionRate,
        handoffAccuracy,
        totalConversations,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyPerformanceData = async (timePeriod, page) => {
    setIsDailyPerformanceLoading(true);
    try {
      const endpoint = getFullUrl(
        `${overviewApiPath}?period=${timePeriod}&page=${page}`
      );
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const dailyPerformance = data?.dailyPerformanceSummary?.data;
      const dailyPerformancePagination =
        data?.dailyPerformanceSummary?.pagination;

      const processedDailyPerformance = dailyPerformance?.map((day) => {
        return {
          ...day,
          date: day?.date && format(new Date(day?.date), "MMM dd, yyyy"),
        };
      });

      setDailyPerformanceData(processedDailyPerformance);
      setDailyPerformancePagination(dailyPerformancePagination);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsDailyPerformanceError(true);
    } finally {
      setIsDailyPerformanceLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData(timePeriod, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod]);

  return {
    isLoading,
    isError,
    isDailyPerformanceLoading,
    isDailyPerformanceError,
    conversationVolumeChartData,
    aiPerformanceChartData,
    dailyPerformanceData,
    dailyPerformancePagination,
    overallMetricsData,
    actionSuccessRate,
    aiResolutionRate,
    handoffAccuracy,
    totalConversations,
    totalPages,
    currentPage,
    metricTooltips,
    fetchOverviewData,
    fetchDailyPerformanceData,
  };
};

export default useOverview;
