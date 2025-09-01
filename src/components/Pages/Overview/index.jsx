"use client";

import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";
import TooltipComponent from "@/components/Shared/Common/Tooltip";
import {
  ArrowDown,
  ArrowUp,
  Activity,
  BarChart3,
  Bot,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  ShieldQuestionIcon,
  Target,
  TrendingUp,
  Users,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useOverviewV2 from "./useOverviewV2";

// Custom tooltip for pie chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 shadow-lg rounded border border-gray-200">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-semibold">{payload[0].value}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-semibold">{payload[0].payload.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom label for pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show labels for small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const OverviewV2Section = () => {
  const {
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
  } = useOverviewV2();

  // Colors for handoff reasons pie chart
  const COLORS = {
    needs_account_access: "#ef4444",
    payment_issue: "#f97316",
    technical_complex: "#eab308",
    not_in_knowledge: "#84cc16",
    customer_requested: "#22c55e",
    unclear_question: "#14b8a6",
    system_error: "#06b6d4",
    other: "#9333ea",
  };

  // Format handoff reason for display
  const formatHandoffReason = (reason) => {
    if (!reason) return "Other";
    return reason
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return <LoadingSection />;
  }

  if (isError) {
    return <ErrorSection />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range and Refresh Controls */}
        <div className="flex justify-end items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="TODAY">Today</option>
              <option value="L7D">Last 7 Days</option>
              <option value="L30D">Last 30 Days</option>
              <option value="L90D">Last 90 Days</option>
              <option value="L365D">Last Year</option>
            </select>
          </div>
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        {/* Overall Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 ai-resolution-tooltip cursor-help">
                  AI Resolution Rate
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {overallMetrics?.aiResolutionRate?.value || "0%"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overallMetrics?.aiResolutionRate?.subtitle || "No data"}
                </p>
              </div>
              <Bot className="w-10 h-10 text-green-500 opacity-50" />
            </div>
            <TooltipComponent
              anchorSelect=".ai-resolution-tooltip"
              text="Percentage of conversations fully resolved by AI without human intervention"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 total-conversations-tooltip cursor-help">
                  Total Conversations
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {overallMetrics?.totalConversations?.value || "0"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overallMetrics?.totalConversations?.subtitle || "No data"}
                </p>
              </div>
              <MessageSquare className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
            <TooltipComponent
              anchorSelect=".total-conversations-tooltip"
              text="Total number of customer conversations in the selected time period"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 handoff-accuracy-tooltip cursor-help">
                  Handoff Accuracy
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {overallMetrics?.handoffAccuracy?.value || "0%"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {overallMetrics?.handoffAccuracy?.subtitle || "No data"}
                </p>
              </div>
              <Target className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
            <TooltipComponent
              anchorSelect=".handoff-accuracy-tooltip"
              text="Accuracy of AI in routing conversations to the correct support team"
            />
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Conversation Volume Trend */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Conversation Volume Trend
              </h3>
              <a className="conversation-volume-tooltip cursor-pointer" href="#">
                <ShieldQuestionIcon className="w-4 h-4 text-blue-500" />
              </a>
              <TooltipComponent
                anchorSelect=".conversation-volume-tooltip"
                text={
                  <div className="max-w-md">
                    Daily breakdown of conversation volumes:
                    <br />• Total: All conversations
                    <br />• AI Resolved: Handled entirely by AI
                    <br />• AI + Human: Combined effort of AI and human agents
                  </div>
                }
              />
            </div>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversationVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => {
                      return new Date(tick).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="aiResolved"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="AI Resolved"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="humanAssisted"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="AI + Human"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Handoff Reasons */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-500" />
                Top Handoff Reasons
              </h3>
              <a className="handoff-reasons-tooltip cursor-pointer" href="#">
                <ShieldQuestionIcon className="w-4 h-4 text-blue-500" />
              </a>
              <TooltipComponent
                anchorSelect=".handoff-reasons-tooltip"
                text="Distribution of reasons why conversations were handed off to human agents"
              />
            </div>
            <div style={{ height: "300px" }}>
              {handoffReasonsData && handoffReasonsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={handoffReasonsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {handoffReasonsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.reason] || COLORS.other}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No handoff data available
                </div>
              )}
            </div>
            {/* Legend for pie chart */}
            {handoffReasonsData && handoffReasonsData.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {handoffReasonsData.slice(0, 6).map((entry) => (
                  <div key={entry.reason} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: COLORS[entry.reason] || COLORS.other }}
                    />
                    <span className="truncate">{formatHandoffReason(entry.reason)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Routing Accuracy */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-500" />
                Routing Accuracy by Team
              </h3>
              <a className="routing-accuracy-tooltip cursor-pointer" href="#">
                <ShieldQuestionIcon className="w-4 h-4 text-blue-500" />
              </a>
              <TooltipComponent
                anchorSelect=".routing-accuracy-tooltip"
                text={
                  <div className="max-w-md">
                    AI routing accuracy by team:
                    <br />• Correct: AI routed to the right team
                    <br />• Incorrect: AI routed to wrong team
                    <br />• Accuracy %: Team-specific accuracy rate
                  </div>
                }
              />
            </div>
            <div style={{ height: "300px" }}>
              {routingAccuracyData && routingAccuracyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routingAccuracyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="team"
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
                    <Bar
                      yAxisId="left"
                      dataKey="correct"
                      fill="#10b981"
                      name="Correctly Routed"
                      stackId="a"
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="incorrect"
                      fill="#ef4444"
                      name="Incorrectly Routed"
                      stackId="a"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Accuracy %"
                      dot={{ r: 4 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No routing accuracy data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Performance Summary Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />
            Daily Performance Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Conversations
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Human Handoffs
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Handoff Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Resolution Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Routing Accuracy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyPerformanceData?.map((day) => (
                  <tr key={day?.date} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {day?.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center">
                        <span>{day?.totalConversations?.value || 0}</span>
                        {day?.totalConversations?.trend && (
                          <span
                            className={`ml-2 flex items-center text-xs px-1.5 py-0.5 rounded-md ${
                              day.totalConversations.trend.trend === "up"
                                ? "text-green-600 bg-green-50"
                                : day.totalConversations.trend.trend === "down"
                                ? "text-red-600 bg-red-50"
                                : "text-gray-600 bg-gray-50"
                            }`}
                          >
                            {day.totalConversations.trend.trend === "up" ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : day.totalConversations.trend.trend === "down" ? (
                              <ArrowDown className="w-3 h-3" />
                            ) : null}
                            <span className="ml-0.5">
                              {Math.abs(day.totalConversations.trend.percentage)}%
                            </span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {day?.humanHandoffs?.value || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(day?.handoffRate?.value || 0) > 30
                            ? "bg-red-100 text-red-800"
                            : parseFloat(day?.handoffRate?.value || 0) > 20
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {day?.handoffRate?.value || "0%"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(day?.aiResolutionRate?.value || 0) < 70
                            ? "bg-red-100 text-red-800"
                            : parseFloat(day?.aiResolutionRate?.value || 0) < 80
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {day?.aiResolutionRate?.value || "0%"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          parseFloat(day?.routingAccuracy?.value || 0) < 80
                            ? "bg-red-100 text-red-800"
                            : parseFloat(day?.routingAccuracy?.value || 0) < 90
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {day?.routingAccuracy?.value || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center space-x-3">
              <button
                onClick={() => fetchDailyPerformanceData(undefined, currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchDailyPerformanceData(undefined, currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewV2Section;