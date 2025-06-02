// @ts-nocheck

"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  CheckSquare,
  Target,
  TrendingUp,
  Users,
  Users2,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
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
import { useAppContext } from "../../../components/AppContext";
import { Error, LoadingSpinner } from "../../../components/lib/utils";
import { getFullUrl } from "../../../utils/getFullUrl";
import type { SectionProps } from "../types";

interface CategoryResolutionDataPoint {
  categoryName: string;
  aiResolved: number;
  humanAssisted: number;
  notResolved: number;
  total: number;
  aiResolvedPercent: number;
  humanAssistedPercent: number;
  notResolvedPercent: number;
}

interface TeamRoutingDataPoint {
  team: string;
  correct: number;
  reassign: number;
  total: number;
}

const AIPerformanceSection: React.FC<SectionProps> = ({
  selectedTimePeriod,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [accuracyMetricsData, setAccuracyMetricsData] = useState<any[]>([]);
  const [conversationResolutionData, setConversationResolutionData] = useState<
    any[]
  >([]);
  const [knowledgeRetrievalData, setKnowledgeRetrievalData] = useState<any[]>(
    []
  );
  const [routingAccuracyData, setRoutingAccuracyData] = useState<any[]>([]);
  const [qualityPerformanceData, setQualityPerformanceData] = useState<any[]>(
    []
  );
  const [handoffReasonsData, setHandoffReasonsData] = useState<any[]>([]);

  const { timePeriod } = useAppContext();

  const aiPerformanceApiPath = process.env.NEXT_PUBLIC_AI_PERFORMANCE_API_PATH;

  // Time series data for the line charts
  // const accuracyMetricsData = useMemo(
  //   () => [
  //     { date: "Jan 1", intentAccuracy: 89.2, handoffAccuracy: 84.1 },
  //     { date: "Jan 8", intentAccuracy: 90.1, handoffAccuracy: 85.3 },
  //     { date: "Jan 15", intentAccuracy: 91.3, handoffAccuracy: 86.7 },
  //     { date: "Jan 22", intentAccuracy: 90.8, handoffAccuracy: 85.9 },
  //     { date: "Jan 29", intentAccuracy: 92.4, handoffAccuracy: 86.9 },
  //     { date: "Feb 5", intentAccuracy: 91.7, handoffAccuracy: 87.2 },
  //     { date: "Feb 12", intentAccuracy: 92.1, handoffAccuracy: 86.5 },
  //     { date: "Feb 19", intentAccuracy: 93.0, handoffAccuracy: 87.8 },
  //   ],
  //   []
  // );

  // const qualityPerformanceData = useMemo(
  //   () => [
  //     { date: "Jan 1", contextQuality: 6.2, actionSuccessRate: 72.5 },
  //     { date: "Jan 8", contextQuality: 6.4, actionSuccessRate: 74.1 },
  //     { date: "Jan 15", contextQuality: 6.6, actionSuccessRate: 76.8 },
  //     { date: "Jan 22", contextQuality: 6.5, actionSuccessRate: 75.9 },
  //     { date: "Jan 29", contextQuality: 6.8, actionSuccessRate: 76.3 },
  //     { date: "Feb 5", contextQuality: 6.9, actionSuccessRate: 77.2 },
  //     { date: "Feb 12", contextQuality: 6.7, actionSuccessRate: 75.8 },
  //     { date: "Feb 19", contextQuality: 7.1, actionSuccessRate: 78.4 },
  //   ],
  //   []
  // );

  // Category resolution data
  // const initialCategoryData: Omit<
  //   CategoryResolutionDataPoint,
  //   | "total"
  //   | "aiResolvedPercent"
  //   | "humanAssistedPercent"
  //   | "notResolvedPercent"
  // >[] = [
  //   {
  //     categoryName: "Product Inquiry",
  //     aiResolved: 150,
  //     humanAssisted: 50,
  //     notResolved: 20,
  //   },
  //   {
  //     categoryName: "Technical Support",
  //     aiResolved: 80,
  //     humanAssisted: 120,
  //     notResolved: 30,
  //   },
  //   {
  //     categoryName: "Billing Question",
  //     aiResolved: 60,
  //     humanAssisted: 30,
  //     notResolved: 10,
  //   },
  //   {
  //     categoryName: "Account Management",
  //     aiResolved: 90,
  //     humanAssisted: 20,
  //     notResolved: 5,
  //   },
  //   {
  //     categoryName: "General Feedback",
  //     aiResolved: 25,
  //     humanAssisted: 10,
  //     notResolved: 5,
  //   },
  // ];

  // const categoryResolutionData = useMemo((): CategoryResolutionDataPoint[] => {
  //   return initialCategoryData.map((cat) => {
  //     const total = cat.aiResolved + cat.humanAssisted + cat.notResolved;
  //     return {
  //       ...cat,
  //       total,
  //       aiResolvedPercent: total > 0 ? (cat.aiResolved / total) * 100 : 0,
  //       humanAssistedPercent: total > 0 ? (cat.humanAssisted / total) * 100 : 0,
  //       notResolvedPercent: total > 0 ? (cat.notResolved / total) * 100 : 0,
  //     };
  //   });
  // }, []);

  // Team routing data
  // const initialTeamRoutingData: TeamRoutingDataPoint[] = [
  //   { team: "Technical Support", correct: 1204, reassign: 210, total: 1414 },
  //   { team: "Sales Team", correct: 315, reassign: 82, total: 397 },
  //   { team: "Billing Team", correct: 290, reassign: 34, total: 324 },
  //   { team: "General Support", correct: 44, reassign: 17, total: 61 },
  // ];

  // const teamRoutingData = useMemo(() => initialTeamRoutingData, []);

  // --- Sample Data (to be replaced with actual data fetching) ---
  // const intentRecognitionData = useMemo(
  //   () => [
  //     {
  //       name: "Order Status",
  //       recognized: 450,
  //       needsClarification: 50,
  //       fallback: 10,
  //     },
  //     {
  //       name: "Password Reset",
  //       recognized: 320,
  //       needsClarification: 30,
  //       fallback: 5,
  //     },
  //     {
  //       name: "Product Info",
  //       recognized: 600,
  //       needsClarification: 70,
  //       fallback: 15,
  //     },
  //     {
  //       name: "Tech Support",
  //       recognized: 210,
  //       needsClarification: 40,
  //       fallback: 8,
  //     },
  //     {
  //       name: "Billing Inquiry",
  //       recognized: 150,
  //       needsClarification: 20,
  //       fallback: 3,
  //     },
  //   ],
  //   []
  // );

  // const knowledgeRetrievalData = useMemo(
  //   () => [
  //     { name: "Successful Retrieval", value: 750, color: "#10b981" },
  //     { name: "Low Relevance", value: 150, color: "#f59e0b" },
  //     { name: "No Match Found", value: 100, color: "#ef4444" },
  //   ],
  //   []
  // );

  // const totalKnowledgeQueries = knowledgeRetrievalData.reduce(
  //   (sum, entry) => sum + entry.value,
  //   0
  // );

  // const resolutionData = useMemo(
  //   () => [
  //     { name: "Resolved by AI", value: 750, color: "#22c55e" },
  //     {
  //       name: "Resolved by Human (Post-Handoff)",
  //       value: 150,
  //       color: "#3b82f6",
  //     },
  //     { name: "Open/Unresolved", value: 100, color: "#f43f5e" },
  //   ],
  //   []
  // );

  // const handoffReasonsData = useMemo(
  //   () =>
  //     [
  //       { reason: "Complex Issue", count: 80, fill: "#8884d8" },
  //       { reason: "User Request", count: 45, fill: "#83a6ed" },
  //       { reason: "AI Unable to Understand", count: 30, fill: "#8dd1e1" },
  //       { reason: "System Error/Bug", count: 20, fill: "#82ca9d" },
  //       { reason: "Sentiment Negative", count: 15, fill: "#a4de6c" },
  //     ].sort((a, b) => b.count - a.count),
  //   []
  // );
  // --- End Sample Data ---

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 text-sm">
          <p className="font-medium text-gray-800 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${
                entry.dataKey === "intentAccuracy" ||
                entry.dataKey === "handoffAccuracy"
                  ? "%"
                  : ""
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CategoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryResolutionDataPoint;
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 text-sm">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((bar: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span
                style={{
                  color: bar.fill,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {bar.dataKey === "aiResolvedPercent" && (
                  <CheckCircle className="w-3 h-3 mr-1" />
                )}
                {bar.dataKey === "humanAssistedPercent" && (
                  <Users className="w-3 h-3 mr-1" />
                )}
                {bar.dataKey === "notResolvedPercent" && (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {bar.name}:
              </span>
              <span className="font-semibold ml-2">
                {bar.payload[
                  bar.dataKey.replace("Percent", "")
                ].toLocaleString()}{" "}
                ({bar.value.toFixed(1)}%)
              </span>
            </div>
          ))}
          <p className="text-xs text-gray-600 mt-1 pt-1 border-t">
            Total: {data.total.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const TeamRoutingTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 text-sm">
          <p className="font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((bar: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span
                style={{
                  color: bar.fill,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {bar.dataKey === "correct" && (
                  <CheckSquare className="w-3 h-3 mr-1" />
                )}
                {bar.dataKey === "reassign" && (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {bar.name}:
              </span>
              <span className="font-semibold ml-2">
                {bar.value.toLocaleString()}
              </span>
            </div>
          ))}
          <p className="text-xs text-gray-600 mt-1 pt-1 border-t">
            Total Routed: {payload[0].payload.total.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderKnowledgePieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
    value,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const numericPercentage = percent * 100;
    if (numericPercentage < 5) return null; // Don't render label if too small

    const displayPercentage = numericPercentage.toFixed(0);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} (${displayPercentage}%)`}
      </text>
    );
  };

  const renderResolutionPieLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const displayPercent = (percent * 100).toFixed(0);

    if (parseFloat(displayPercent) < 5) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} (${displayPercent}%)`}
      </text>
    );
  };

  const fetchAIPerformanceData = async (timePeriod: string) => {
    setIsLoading(true);
    try {
      const endpoint = getFullUrl(
        `${aiPerformanceApiPath}?period=${timePeriod}`
      );
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Handle the response data here

      console.log({ data });

      const accuracyMetrics = data?.accuracyMetricsOverTime;
      const conversationResolution = data?.conversationResolutionTypes;
      const knowledgeRetrieval = data?.knowledgeRetrievalEffectiveness;
      const qualityPerformance = data?.qualityPerformanceOverTime;
      const routingAccuracy = data?.routingAccuracyByTeam;
      const topHandoffReasons = data?.topHandoffReasons;

      const processedAccuracyMetricsData = accuracyMetrics.map((item: any) => ({
        date: format(new Date(item.date), "MMM dd"),
        intentAccuracy: item.intentAccuracy,
        handoffAccuracy: item.handoffAccuracy,
      }));

      const processedQualityPerformanceData = qualityPerformance.map(
        (item: any) => ({
          date: format(new Date(item.date), "MMM dd"),
          contextQuality: item.contextQuality,
          actionSuccessRate: item.actionSuccessRate,
        })
      );

      const processedKnowledgeRetrievalData = [
        {
          name: "Low Relevance",
          value: knowledgeRetrieval?.low_relevance,
          color: "#10b981",
        },
        {
          name: "No Match Found",
          value: knowledgeRetrieval?.no_match_found,
          color: "#f59e0b",
        },
        {
          name: "Not Applicable",
          value: knowledgeRetrieval?.not_applicable,
          color: "#ef4444",
        },
        {
          name: "Successful Retrieval",
          value: knowledgeRetrieval?.successful_retrieval,
          color: "#0b65f5",
        },
      ];

      const processedConversationResolutionData = [
        {
          name: "Resolved by AI",
          value: conversationResolution?.resolved_by_ai,
          color: "#22c55e",
        },
        {
          name: "Resolved by Human (Post-Handoff)",
          value: conversationResolution?.resolved_by_human_post_handoff,
          color: "#3b82f6",
        },
        {
          name: "Open/Unresolved",
          value: conversationResolution?.open_unresolved,
          color: "#f43f5e",
        },
      ];

      const routingAccuracyTechnicalSupport =
        routingAccuracy?.technical_support;
      const routingAccuracySalesTeam = routingAccuracy?.sales;
      const routingAccuracyBillingTeam = routingAccuracy?.billing;
      const routingAccuracyGeneral = routingAccuracy?.general;

      const processedRoutingAccuracyData = [
        {
          team: "Technical Support",
          correct: routingAccuracyTechnicalSupport?.correctly_routed,
          reassign: routingAccuracyTechnicalSupport?.reassigned_incorrect,
          total: routingAccuracyTechnicalSupport?.total_ai_handoffs_to_team,
        },
        {
          team: "Sales Team",
          correct: routingAccuracySalesTeam?.correctly_routed,
          reassign: routingAccuracySalesTeam?.reassigned_incorrect,
          total: routingAccuracySalesTeam?.total_ai_handoffs_to_team,
        },
        {
          team: "Billing Team",
          correct: routingAccuracyBillingTeam?.correctly_routed,
          reassign: routingAccuracyBillingTeam?.reassigned_incorrect,
          total: routingAccuracyBillingTeam?.total_ai_handoffs_to_team,
        },
        {
          team: "General",
          correct: routingAccuracyGeneral?.correctly_routed,
          reassign: routingAccuracyGeneral?.reassigned_incorrect,
          total: routingAccuracyGeneral?.total_ai_handoffs_to_team,
        },
      ];

      const processedHandoffReasonsData = [
        // { reason: "Complex Issue", count: 80, fill: "#8884d8" },
        // {
        //   reason: "Complex Issue",
        //   count: topHandoffReasons?.complex_issue,
        //   fill: "#8884d8",
        // },
        // {
        //   reason: "Knowledge Gap",
        //   count: topHandoffReasons?.knowledge_gap,
        //   fill: "#83a6ed",
        // },
        {
          reason: "User Request",
          count: topHandoffReasons?.user_request,
          fill: "#8dd1e1",
        },
        // {
        //   reason: "AI Unable to Understand",
        //   count: topHandoffReasons?.ai_unable_to_understand,
        //   fill: "#82ca9d",
        // },
        // {
        //   reason: "System Error/Bug",
        //   count: topHandoffReasons?.system_error_or_bug,
        //   fill: "#a4de6c",
        // },
        // {
        //   reason: "Negative Sentiment",
        //   count: topHandoffReasons?.sentiment_negative,
        //   fill: "#ffc658",
        // },
        {
          reason: "EPP Validation Manual Review",
          count: topHandoffReasons?.epp_validation_manual_review,
          fill: "#ff8042",
        },
        {
          reason: "KB Initiated Handoff",
          count: topHandoffReasons?.ka_initiated_handoff,
          fill: "#c942ff",
        },
      ].sort((a, b) => b.count - a.count);

      setAccuracyMetricsData(processedAccuracyMetricsData);
      setQualityPerformanceData(processedQualityPerformanceData);
      setKnowledgeRetrievalData(processedKnowledgeRetrievalData);

      setConversationResolutionData(processedConversationResolutionData);

      setRoutingAccuracyData(processedRoutingAccuracyData);
      setHandoffReasonsData(processedHandoffReasonsData);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching AI performance data:", error);
      setIsLoading(false);
      setError(true);
    }
  };

  useEffect(() => {
    fetchAIPerformanceData(timePeriod);
  }, [timePeriod]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">AI Performance Analysis</h2>
        <p className="text-sm text-gray-500">
          Displaying data for time period: {selectedTimePeriod}
        </p>
      </div>

      {/* Performance Line Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accuracy Metrics Line Chart */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" /> Accuracy Metrics
            Over Time
          </h3>
          <div style={{ height: "450px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={accuracyMetricsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[80, 95]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 text-sm">
                          <p className="font-medium text-gray-800 mb-1">
                            {label}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <p
                              key={`item-${index}`}
                              style={{ color: entry.color }}
                            >
                              {`${entry.name}: ${entry.value}${
                                entry.dataKey === "intentAccuracy" ||
                                entry.dataKey === "handoffAccuracy"
                                  ? "%"
                                  : ""
                              }`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="intentAccuracy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Intent Accuracy (%)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="handoffAccuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Handoff Accuracy (%)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality & Performance Line Chart */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-500" /> Quality &
            Performance Over Time
          </h3>
          <div style={{ height: "450px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={qualityPerformanceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  domain={[5.5, 7.5]}
                  label={{
                    value: "Context Quality (0-10)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  domain={[70, 80]}
                  label={{
                    value: "Action Success Rate (%)",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded shadow-lg border border-gray-200 text-sm">
                          <p className="font-medium text-gray-800 mb-1">
                            {label}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <p
                              key={`item-${index}`}
                              style={{ color: entry.color }}
                            >
                              {`${entry.name}: ${entry.value}${
                                entry.dataKey === "actionSuccessRate"
                                  ? "%"
                                  : "/10"
                              }`}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="contextQuality"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Context Quality (RAG)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="actionSuccessRate"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Action Success Rate (%)"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Intent Recognition and Knowledge Retrieval Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intent Recognition Accuracy */}
        {/* <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" /> Intent Recognition Accuracy
          </h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intentRecognitionData} layout="vertical" margin={{ right: 20, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                <Bar dataKey="recognized" stackId="a" fill="#3b82f6" name="Successfully Recognized" barSize={20} isAnimationActive={false} />
                <Bar dataKey="needsClarification" stackId="a" fill="#f59e0b" name="Needs Clarification" barSize={20} isAnimationActive={false} />
                <Bar dataKey="fallback" stackId="a" fill="#ef4444" name="Fallback / Not Understood" barSize={20} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Conversation
            Resolution Types
          </h3>
          <div style={{ height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conversationResolutionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderResolutionPieLabel}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {conversationResolutionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Knowledge Retrieval Effectiveness */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" /> Knowledge
            Retrieval Effectiveness
          </h3>
          <div
            style={{ height: "350px" }}
            className="flex items-center justify-center"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={knowledgeRetrievalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderKnowledgePieLabel}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={false}
                >
                  {knowledgeRetrievalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Resolution Types and Handoff Reasons Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Resolution Rates */}
        {/* <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-500" /> Category Resolution Rates
          </h3>
          <div style={{ height: `${Math.max(200, categoryResolutionData.length * 60)}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryResolutionData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="categoryName" 
                  width={150} 
                  tick={{ fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip content={<CategoryTooltip />} cursor={{ fill: 'rgba(230, 230, 230, 0.5)' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                <Bar dataKey="aiResolvedPercent" name="AI Resolved" stackId="a" fill="#10b981" barSize={25} isAnimationActive={false} />
                <Bar dataKey="humanAssistedPercent" name="Human Assisted" stackId="a" fill="#f59e0b" barSize={25} isAnimationActive={false} />
                <Bar dataKey="notResolvedPercent" name="Not Resolved" stackId="a" fill="#ef4444" barSize={25} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Resolution Types Pie Chart */}
      </div>

      {/* Handoff Reasons Chart Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Handoff Reasons Bar Chart */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" /> Top
            Handoff Reasons
          </h3>
          <div style={{ height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={handoffReasonsData}
                layout="vertical"
                margin={{ left: 120, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="reason"
                  tick={{ fontSize: 12 }}
                  width={110}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(230, 230, 230, 0.5)" }}
                />
                <Bar
                  dataKey="count"
                  name="Handoff Count"
                  barSize={20}
                  isAnimationActive={false}
                >
                  {handoffReasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Routing Accuracy Chart */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Users2 className="w-5 h-5 mr-2 text-indigo-500" /> Routing Accuracy
          </h3>
          <div
            style={{
              height: `${Math.max(200, routingAccuracyData.length * 80)}px`,
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={routingAccuracyData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 20 }}
                barGap={4}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="team"
                  width={150}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<TeamRoutingTooltip />}
                  cursor={{ fill: "rgba(230, 230, 230, 0.5)" }}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12, paddingTop: "10px" }}
                  verticalAlign="top"
                  align="right"
                />
                <Bar
                  dataKey="correct"
                  name="Correctly Routed"
                  fill="#22c55e"
                  barSize={20}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="reassign"
                  name="Reassigned/Incorrect"
                  fill="#facc15"
                  barSize={20}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPerformanceSection;
