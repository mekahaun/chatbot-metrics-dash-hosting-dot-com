import { getRoutes, getFullUrl } from "@/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";

const useAIPerformance = (timePeriod) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [accuracyMetricsData, setAccuracyMetricsData] = useState([]);
  const [conversationResolutionData, setConversationResolutionData] = useState(
    []
  );
  const [knowledgeRetrievalData, setKnowledgeRetrievalData] = useState([]);
  const [routingAccuracyData, setRoutingAccuracyData] = useState([]);
  const [qualityPerformanceData, setQualityPerformanceData] = useState([]);
  const [handoffReasonsData, setHandoffReasonsData] = useState([]);

  const { aiPerformanceApiPath } = getRoutes();

  const fetchAIPerformanceData = async (timePeriod) => {
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

      const accuracyMetrics = data?.accuracyMetricsOverTime;
      const conversationResolution = data?.conversationResolutionTypes;
      const knowledgeRetrieval = data?.knowledgeRetrievalEffectiveness;
      const qualityPerformance = data?.qualityPerformanceOverTime;
      const routingAccuracy = data?.routingAccuracyByTeam;
      const topHandoffReasons = data?.topHandoffReasons;

      const processedAccuracyMetricsData = accuracyMetrics.map((item) => ({
        date: format(new Date(item.date), "MMM dd"),
        intentAccuracy: item.intentAccuracy,
        handoffAccuracy: item.handoffAccuracy,
      }));

      const processedQualityPerformanceData = qualityPerformance.map(
        (item) => ({
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

      const generateColorFromText = (text) => {
        // Simple hash-based color generator from string
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
          hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = `#${((hash >> 24) & 0xff)
          .toString(16)
          .padStart(2, "0")}${((hash >> 16) & 0xff)
          .toString(16)
          .padStart(2, "0")}${((hash >> 8) & 0xff)
          .toString(16)
          .padStart(2, "0")}`;
        return color.slice(0, 7); // Ensure it's a valid hex
      };

      const processedHandoffReasonsData = Object.entries(
        topHandoffReasons || {}
      )
        .map(([key, count]) => {
          const reason = key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return {
            reason,
            count,
            fill: generateColorFromText(reason),
          };
        })
        .sort((a, b) => b.count - a.count);

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

  return {
    isLoading,
    isError,
    accuracyMetricsData,
    conversationResolutionData,
    knowledgeRetrievalData,
    routingAccuracyData,
    qualityPerformanceData,
    handoffReasonsData,
  };
};

export default useAIPerformance;
