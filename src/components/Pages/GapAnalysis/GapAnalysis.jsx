"use client";

import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Lightbulb,
  RefreshCw,
  Search,
  Shield,
  Tool,
  TrendingUp,
  XCircle,
  Zap,
  MessageSquare,
  Users,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAppContext } from "@/components/context/AppContext";
import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";
import { getFullUrl } from "@/utils";

const getGapTypeIcon = (gapType) => {
  switch (gapType) {
    case "knowledge_gap":
      return <Brain className="w-4 h-4" />;
    case "tool_gap":
      return <Tool className="w-4 h-4" />;
    case "legitimate_handoff":
      return <Shield className="w-4 h-4" />;
    case "completeness_gap":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

const getGapTypeColor = (gapType) => {
  switch (gapType) {
    case "knowledge_gap":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "tool_gap":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "legitimate_handoff":
      return "bg-green-100 text-green-700 border-green-200";
    case "completeness_gap":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-700 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const GapAnalysis = () => {
  const { timePeriod } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchConversationId, setSearchConversationId] = useState("");
  const [selectedGapType, setSelectedGapType] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);

  const fetchGapAnalyses = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = `/api/gap-analysis-v2?period=${timePeriod}&pageSize=20&page=${page}`;
      
      if (searchConversationId) {
        url += `&conversationId=${searchConversationId}`;
      }
      
      if (selectedGapType) {
        url += `&gapType=${selectedGapType}`;
      }
      
      if (selectedSeverity) {
        url += `&severity=${selectedSeverity}`;
      }

      const response = await fetch(getFullUrl(url), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch gap analyses: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching gap analyses:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGapAnalyses(currentPage);
  }, [timePeriod, currentPage, searchConversationId, selectedGapType, selectedSeverity]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGapAnalyses(1);
  };

  const handleRefresh = () => {
    fetchGapAnalyses(currentPage);
  };

  const toggleAnalysisExpansion = (conversationId) => {
    setExpandedAnalysis(expandedAnalysis === conversationId ? null : conversationId);
  };

  if (isLoading && !data) {
    return <LoadingSection message="Loading gap analyses..." />;
  }

  if (error) {
    return <ErrorSection message={error} onRetry={handleRefresh} />;
  }

  const aggregations = data?.aggregations || {};
  const records = data?.records || [];
  const totalPages = data?.query?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Refresh button at the top right */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Aggregation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Handoffs</p>
              <p className="text-2xl font-bold text-gray-900">
                {aggregations.totalCount || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Preventable</p>
              <p className="text-2xl font-bold text-orange-600">
                {aggregations.preventableHandoffs || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {aggregations.totalCount > 0 
                  ? `${Math.round((aggregations.preventableHandoffs / aggregations.totalCount) * 100)}%`
                  : '0%'}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Legitimate</p>
              <p className="text-2xl font-bold text-green-600">
                {aggregations.legitimateHandoffs || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {aggregations.totalCount > 0 
                  ? `${Math.round((aggregations.legitimateHandoffs / aggregations.totalCount) * 100)}%`
                  : '0%'}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Gap Type</p>
              <p className="text-lg font-bold text-gray-900">
                {Object.entries(aggregations.byGapType || {}).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace('_', ' ') || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Object.entries(aggregations.byGapType || {}).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} occurrences
              </p>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by conversation ID..."
                value={searchConversationId}
                onChange={(e) => setSearchConversationId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </form>

          <select
            value={selectedGapType || ""}
            onChange={(e) => {
              setSelectedGapType(e.target.value || null);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Gap Types</option>
            <option value="knowledge_gap">Knowledge Gap</option>
            <option value="tool_gap">Tool Gap</option>
            <option value="legitimate_handoff">Legitimate Handoff</option>
            <option value="completeness_gap">Completeness Gap</option>
          </select>

          <select
            value={selectedSeverity || ""}
            onChange={(e) => {
              setSelectedSeverity(e.target.value || null);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => {
              setSearchConversationId("");
              setSelectedGapType(null);
              setSelectedSeverity(null);
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Gap Analysis List */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversation
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Intent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gap Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((analysis) => (
                <React.Fragment key={analysis.conversationId}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          #{analysis.conversationId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(parseISO(analysis.timestamp), "MMM dd, HH:mm")}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {analysis.userIntent}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {analysis.intentCategory}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getGapTypeColor(analysis.gapType)}`}>
                        {getGapTypeIcon(analysis.gapType)}
                        {analysis.gapType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getSeverityColor(analysis.gapSeverity)}`}>
                        {analysis.gapSeverity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {analysis.wasHandoffAppropriate ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {analysis.wasHandoffAppropriate ? "Appropriate" : "Preventable"}
                        </span>
                      </div>
                      {analysis.couldBeAutomated && (
                        <span className="text-xs text-purple-600 mt-1 block">
                          Automatable ({analysis.automationComplexity})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAnalysisExpansion(analysis.conversationId)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedAnalysis === analysis.conversationId ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedAnalysis === analysis.conversationId && (
                    <tr>
                      <td colSpan="6" className="px-4 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* Gap Description */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Gap Description</h4>
                            <p className="text-sm text-gray-600">{analysis.gapDescription}</p>
                          </div>

                          {/* Reasoning */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Assessment Reasoning</h4>
                            <p className="text-sm text-gray-600">{analysis.reasoning}</p>
                          </div>

                          {/* Recommendations */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Immediate Actions */}
                            {analysis.immediateActions.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border">
                                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-yellow-500" />
                                  Immediate Actions
                                </h5>
                                <ul className="space-y-1">
                                  {analysis.immediateActions.map((action, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-gray-400 mt-1">•</span>
                                      <span>{action}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Knowledge Improvements */}
                            {analysis.knowledgeImprovements.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border">
                                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-purple-500" />
                                  Knowledge Base Updates
                                </h5>
                                <ul className="space-y-1">
                                  {analysis.knowledgeImprovements.map((improvement, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-gray-400 mt-1">•</span>
                                      <span>{improvement}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Tool Development */}
                            {analysis.toolDevelopment.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border">
                                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                  <Tool className="w-4 h-4 text-blue-500" />
                                  Tool Development
                                </h5>
                                <ul className="space-y-1">
                                  {analysis.toolDevelopment.map((tool, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                      <span className="text-gray-400 mt-1">•</span>
                                      <span>{tool}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>Team: {analysis.handoffTeam}</span>
                            <span>Messages: {analysis.messageCount}</span>
                            <span>Inbox: {analysis.inboxName}</span>
                            <span>Complexity: {analysis.complexity}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {records.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No gap analyses found for the selected criteria.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GapAnalysis;