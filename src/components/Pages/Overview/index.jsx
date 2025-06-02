"use client";

import { useAppContext } from "@/components/context/AppContext";
import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";
import envs from "@/utils/getEnv";
import getFullUrl from "@/utils/getFullUrl";
import { format } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const OverviewSection = () => {
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

  const [groupBy, setGroupBy] = useState("daily");

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

  const overviewApiPath = envs.overviewApiPath;

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
    } catch (error) {
      setIsDailyPerformanceError(true);
    } finally {
      setIsDailyPerformanceLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData(timePeriod, currentPage);
  }, [timePeriod]);

  if (isLoading) {
    return <LoadingSection />;
  }

  if (isError) {
    return <ErrorSection />;
  }

  return (
    <div className="space-y-6">
      {/* Row 2: Time Series Graph (Left) and Activity Logs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Conversation Volume Chart */}
        <div className="bg-white p-4 shadow rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Conversation Volume Trend
            </h3>
          </div>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversationVolumeChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) => {
                    if (groupBy === "daily")
                      return new Date(tick).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      });
                    if (groupBy === "weekly")
                      return tick.split("-W")[1]
                        ? `W${tick.split("-W")[1]}`
                        : tick;
                    return new Date(tick + "-02").toLocaleDateString([], {
                      month: "short",
                      year: "2-digit",
                    });
                  }}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                  tickLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12, paddingTop: "10px" }}
                />
                <Line
                  type="monotone"
                  dataKey="totalConversations"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Conversations"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="aiResolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Only AI"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="humanAssisted"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="AI + Human"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="stillPending"
                  stroke="#f5220b"
                  strokeWidth={2}
                  name="Still Pending"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 2: AI Performance Trends */}
        <div className="bg-white p-4 shadow rounded-lg h-full flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" /> AI Performance
            Trends
          </h3>
          <div className="flex-grow" style={{ minHeight: "250px" }}>
            {" "}
            {/* Ensure chart has space */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={aiPerformanceChartData}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  style={{ fontSize: "0.75rem" }}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  yAxisId="percentage"
                  orientation="left"
                  stroke="#8b5cf6"
                  style={{ fontSize: "0.75rem" }}
                  tick={{ fill: "#6b7280" }}
                />
                <YAxis
                  domain={[0, 5]}
                  tickFormatter={(value) => value.toFixed(1)}
                  yAxisId="score"
                  orientation="right"
                  stroke="#10b981"
                  style={{ fontSize: "0.75rem" }}
                  tick={{ fill: "#6b7280" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: "0.8rem",
                  }}
                  itemStyle={{ padding: "2px 0" }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ fontSize: "0.8rem" }}
                />
                <Line
                  type="monotone"
                  dataKey="intentAccuracy"
                  name="Intent Accuracy (%)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  yAxisId="percentage"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="contextQuality"
                  name="Context Quality (Score)"
                  stroke="#10b981"
                  strokeWidth={2}
                  yAxisId="score"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="actionSuccess"
                  name="Action Success (%)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  yAxisId="percentage"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="handoffAccuracy"
                  name="Handoff Accuracy (%)"
                  stroke="#ec4899"
                  strokeWidth={2}
                  yAxisId="percentage"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>{" "}
      {/* Closes Row 2 grid */}
      {/* Row 3: Daily Stats Table */}
      <div className="bg-white p-4 shadow rounded-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Daily Performance Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Conversations
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Human Handoffs
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Intent Accuracy
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Avg Content Quality
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyPerformanceData?.map((day) => (
                <tr key={day?.date} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {day?.date}
                  </td>
                  {[
                    day?.totalConversations,
                    day?.humanHandoffs,
                    day?.intentAccuracy,
                    day?.avgContentQuality,
                  ].map((stat, index) => (
                    <td
                      key={index}
                      className="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
                    >
                      <div className="flex items-center">
                        <span>
                          {stat?.value}
                          {stat?.isPercentage && "%"}
                        </span>
                        {stat?.trend &&
                          !(Math.abs(stat?.trend?.percentage) === 0) && (
                            <span
                              className={`ml-2 flex items-center text-xs px-1.5 py-0.5 rounded-md bg-gray-100 ${
                                stat?.trend?.trend === "up" && "text-green-600"
                              } ${
                                stat?.trend?.trend === "down" && "text-red-600"
                              }`}
                            >
                              {stat?.trend?.trend === "up" && (
                                <ArrowUp className="w-3 h-3" />
                              )}

                              {stat?.trend?.trend === "down" && (
                                <ArrowDown className="w-3 h-3" />
                              )}

                              <span className="ml-0.5">
                                {Math.abs(stat?.trend?.percentage)}
                                {stat?.trend?.percentage && "%"}
                              </span>
                            </span>
                          )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center space-x-3">
            <button
              onClick={() =>
                fetchDailyPerformanceData(timePeriod, currentPage - 1)
              }
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() =>
                fetchDailyPerformanceData(timePeriod, currentPage + 1)
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>
      {/* Key Statistics Section */}
      <div className="bg-white p-4 shadow rounded-lg mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-500" /> Overall Performance
          Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-4 border rounded-lg group relative">
            <div className="absolute top-0 -translate-y-full pointer-events-none right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 max-w-xs">
                {metricTooltips.aiResolutionRate}
              </div>
            </div>
            <p className="text-sm text-gray-500">AI Resolution Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {aiResolutionRate?.value}
            </p>
            <p className="text-xs text-gray-400">
              {aiResolutionRate?.subtitle}
            </p>
          </div>
          <div className="p-4 border rounded-lg group relative">
            <div className="absolute top-0 -translate-y-full pointer-events-none right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 max-w-xs">
                {metricTooltips.totalConversations}
              </div>
            </div>
            <p className="text-sm text-gray-500">Total Conversations</p>
            <p className="text-2xl font-bold text-gray-700">
              {totalConversations?.value}
            </p>
            <p className="text-xs text-gray-400">
              {totalConversations?.subtitle}
            </p>
          </div>
          <div className="p-4 border rounded-lg group relative">
            <div className="absolute top-0 -translate-y-full pointer-events-none right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 max-w-xs">
                {metricTooltips.actionSuccessRate}
              </div>
            </div>
            <p className="text-sm text-gray-500">Action Success Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {actionSuccessRate?.value}
            </p>
            <p className="text-xs text-gray-400">
              {actionSuccessRate?.subtitle}
            </p>
          </div>
          <div className="p-4 border rounded-lg group relative">
            <div className="absolute top-0 -translate-y-full right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 max-w-xs">
                {metricTooltips.handoffAccuracy}
              </div>
            </div>
            <p className="text-sm text-gray-500">Handoff Accuracy</p>
            <p className="text-2xl font-bold text-purple-600">
              {handoffAccuracy?.value}
            </p>
            <p className="text-xs text-gray-400">{handoffAccuracy?.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
