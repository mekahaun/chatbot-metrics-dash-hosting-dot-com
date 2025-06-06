// @ts-nocheck

"use client";

import { useAppContext } from "@/components/context/AppContext";
import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";
import AccuracyMetricsChart from "./AccuracyMetricsChart";
import ConversationResolutionChart from "./ConversationResolutionChart";
import HandoffReasonsChart from "./HandoffReasonsChart";
import KnowledgeRetrievalChart from "./KnowledgeRetrievalChart";
import QualityPerformanceChart from "./QualityPerformanceChart";
import RoutingAccuracyChart from "./RoutingAccuracyChart";
import useAIPerformance from "./useAIPerformance";

const AIPerformanceSection = () => {
  const { timePeriod } = useAppContext();
  const {
    isLoading,
    isError,
    accuracyMetricsData,
    conversationResolutionData,
    knowledgeRetrievalData,
    routingAccuracyData,
    qualityPerformanceData,
    handoffReasonsData,
  } = useAIPerformance(timePeriod);

  if (isLoading) {
    return <LoadingSection />;
  }

  if (isError) {
    return <ErrorSection />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">AI Performance Analysis</h2>
        <p className="text-sm text-gray-500">
          Displaying data for time period: {timePeriod}
        </p>
      </div>

      {/* Performance Line Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccuracyMetricsChart data={accuracyMetricsData} />
        <QualityPerformanceChart data={qualityPerformanceData} />
      </div>

      {/* Intent Recognition and Knowledge Retrieval Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConversationResolutionChart data={conversationResolutionData} />
        <KnowledgeRetrievalChart data={knowledgeRetrievalData} />
      </div>

      {/* Handoff Reasons Chart Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HandoffReasonsChart data={handoffReasonsData} />
        <RoutingAccuracyChart data={routingAccuracyData} />
      </div>
    </div>
  );
};

export default AIPerformanceSection;
