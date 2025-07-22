"use client";

import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";
import TooltipComponent from "@/components/Shared/Common/Tooltip";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ShieldQuestionIcon,
  Target,
  Users,
} from "lucide-react";
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
import useOverview from "./useOverview";

const OverviewSection = () => {
  const {
    isLoading,
    isError,
    conversationVolumeChartData,
    aiPerformanceChartData,
    dailyPerformanceData,
    actionSuccessRate,
    aiResolutionRate,
    handoffAccuracy,
    totalConversations,
    totalPages,
    currentPage,
    metricTooltips,
    fetchDailyPerformanceData,
  } = useOverview();

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
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              Conversation Volume Trend
              <a
                className="conversations-volume-trend-tooltip cursor-pointer ml-3 inline-block"
                href="#"
              >
                <ShieldQuestionIcon className="w-5 h-5 mr-2 text-blue-500" />
              </a>
              <TooltipComponent
                anchorSelect=".conversations-volume-trend-tooltip"
                text={
                  <div className="max-w-md">
                    This chart shows the volume and resolution status of
                    conversations over time.
                    <br />
                    <br />
                    Total Conversations: Total number of conversations handled
                    by the system (blue line)
                    <br />
                    <br />
                    Only AI: Conversations resolved entirely by AI without human
                    intervention (green line)
                    <br />
                    <br />
                    AI + Human: Conversations that required both AI and human
                    assistance (yellow line)
                    <br />
                    <br />
                    Still Pending: Conversations that are still active or
                    unresolved (red line)
                  </div>
                }
              />
            </h3>
          </div>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversationVolumeChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) => {
                    return new Date(tick).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
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
            <a
              className="ai-performance-trend-tooltip cursor-pointer ml-3 inline-block"
              href="#"
            >
              <ShieldQuestionIcon className="w-5 h-5 mr-2 text-blue-500" />
            </a>
            <TooltipComponent
              anchorSelect=".ai-performance-trend-tooltip"
              text={
                <div className="max-w-md">
                  This chart tracks multiple AI performance metrics over time on
                  different scales.
                  <br />
                  <br />
                  Intent Accuracy: How confident AI is when understanding user
                  requests (0-100%, purple line)
                  <br />
                  <br />
                  Context Quality (Score): Quality of information retrieved by
                  AI (0-10 scale, teal line)
                  <br />
                  <br />
                  Action Success: Success rate of AI-initiated actions (0-100%,
                  green line)
                  <br />
                  <br />
                  Handoff Accuracy: Accuracy of AI routing decisions (0-100%,
                  pink line)
                </div>
              }
            />
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
          <div className="p-4 border border-gray-200 rounded-lg group relative">
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
          <div className="p-4 border border-gray-200 rounded-lg group relative">
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
          <div className="p-4 border border-gray-200 rounded-lg group relative">
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
          <div className="p-4 border border-gray-200 rounded-lg group relative">
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
