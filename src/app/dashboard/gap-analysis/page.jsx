'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  TrendingUp,
  Bot,
  BookOpen,
  Clock,
  Target,
  Zap,
  AlertCircle,
  Info,
  Users,
  BarChart3,
  Loader2,
  RefreshCw,
  Settings,
  ExternalLink,
  Eye,
  FileText,
  Database,
  CheckSquare,
  XSquare,
  AlertOctagon,
  Inbox
} from 'lucide-react';

const API_BASE_URL = 'https://bvr0iiipte.execute-api.eu-west-1.amazonaws.com/Prod/gap-analysis-v2';

const GapAnalysisPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  
  // Filter states
  const [dateFilter, setDateFilter] = useState('');
  const [conversationIdFilter, setConversationIdFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [aggregations, setAggregations] = useState({});
  
  // Current query info
  const [queryInfo, setQueryInfo] = useState(null);

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize with current date
  useEffect(() => {
    setDateFilter(getCurrentDate());
  }, []);

  // Fetch data from API
  const fetchGapAnalysisData = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = API_BASE_URL;
      const params = new URLSearchParams();
      
      // Add pagination
      params.append('page', page.toString());
      params.append('pageSize', '20');
      
      // Use period for date filtering (V2 API uses period instead of date)
      if (dateFilter) {
        params.append('startDate', dateFilter);
        params.append('endDate', dateFilter);
      } else {
        params.append('period', 'L7D'); // Default to last 7 days
      }
      
      if (conversationIdFilter) {
        params.append('conversationId', conversationIdFilter);
      }
      
      url += `?${params.toString()}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.records || []);
        setQueryInfo(data.query);
        setAggregations(data.aggregations || {});
        setTotalPages(data.query?.totalPages || 1);
        setCurrentPage(page);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchGapAnalysisData(currentPage);
  }, [dateFilter, conversationIdFilter, currentPage]);

  // Toggle card expansion
  const toggleCard = (conversationId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(conversationId)) {
      newExpanded.delete(conversationId);
    } else {
      newExpanded.add(conversationId);
    }
    setExpandedCards(newExpanded);
  };

  // Open conversation in new tab
  const openConversation = (conversationUrl, conversationId) => {
    if (conversationUrl) {
      window.open(conversationUrl, '_blank');
    } else {
      // Fallback URL using the standard structure
      window.open(`https://webchat.mysecurecloudhost.com/app/accounts/1/conversations/${conversationId}`, '_blank');
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get gap type icon
  const getGapTypeIcon = (gapType) => {
    switch (gapType) {
      case 'tool_requirement': return <Settings className="w-4 h-4" />;
      case 'knowledge_gap': return <BookOpen className="w-4 h-4" />;
      case 'information_completeness': return <Info className="w-4 h-4" />;
      case 'legitimate_handoff': return <Users className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get quality indicator color
  const getQualityColor = (quality) => {
    switch (quality) {
      case 'complete':
      case 'accurate':
      case 'highly_relevant':
      case 'fully_actionable':
        return 'text-green-600 bg-green-50';
      case 'mostly_complete':
      case 'mostly_accurate':
      case 'mostly_relevant':
      case 'mostly_actionable':
        return 'text-blue-600 bg-blue-50';
      case 'partial':
      case 'partially_accurate':
      case 'partially_relevant':
      case 'partially_actionable':
        return 'text-yellow-600 bg-yellow-50';
      case 'minimal':
      case 'outdated':
      case 'barely_relevant':
      case 'requires_interpretation':
        return 'text-orange-600 bg-orange-50';
      case 'none':
      case 'unknown':
      case 'not_relevant':
      case 'not_actionable':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Use aggregations from V2 API
  const stats = {
    total: aggregations.totalCount || 0,
    preventable: aggregations.preventableHandoffs || 0,
    legitimate: aggregations.legitimateHandoffs || 0,
    highSeverity: (aggregations.bySeverity?.high || 0) + (aggregations.bySeverity?.critical || 0),
    toolGaps: aggregations.byGapType?.tool_gap || 0,
    knowledgeGaps: aggregations.byGapType?.knowledge_gap || 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                Gap Analysis Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Analyze AI handoff events and identify system improvement opportunities
              </p>
            </div>
            <button
              onClick={fetchGapAnalysisData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Conversation ID
              </label>
              <input
                type="text"
                value={conversationIdFilter}
                onChange={(e) => setConversationIdFilter(e.target.value)}
                placeholder="Enter conversation ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {queryInfo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Info className="w-4 h-4 inline mr-2" />
                Showing results for: <span className="font-medium">{queryInfo.filterType ? queryInfo.filterType.replace('_', ' ') : 'default'}</span>
                {queryInfo.date && ` • Date: ${queryInfo.date}`}
                {queryInfo.conversationId && ` • Conversation: ${queryInfo.conversationId}`}
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preventable</p>
                <p className="text-3xl font-bold text-orange-600">{stats.preventable}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? `${Math.round((stats.preventable / stats.total) * 100)}%` : '0%'}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Legitimate</p>
                <p className="text-3xl font-bold text-green-600">{stats.legitimate}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0 ? `${Math.round((stats.legitimate / stats.total) * 100)}%` : '0%'}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tool Gaps</p>
                <p className="text-3xl font-bold text-purple-600">{stats.toolGaps}</p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Knowledge Gaps</p>
                <p className="text-3xl font-bold text-blue-600">{stats.knowledgeGaps}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading gap analysis data...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
            <p className="text-red-700">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Records Found</h3>
            <p className="text-gray-600">No gap analysis records found for the selected filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record) => (
              <div key={record.conversationId} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleCard(record.conversationId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">#{record.conversationId}</span>
                        </div>
                        
                        {/* View Conversation Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openConversation(null, record.conversationId);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Chat
                        </button>
                        
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(record.gapSeverity || 'unknown')}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {record.gapSeverity || 'unknown'}
                        </div>
                        
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
                          {getGapTypeIcon(record.gapType)}
                          {record.gapType ? record.gapType.replace('_', ' ') : 'unknown'}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{record.userIntent || 'No intent specified'}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {record.handoffTeam || 'unknown'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {record.timestamp ? new Date(record.timestamp).toLocaleString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Inbox className="w-4 h-4" />
                          {record.inboxName || 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        {record.couldBeAutomated && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Can be automated
                          </div>
                        )}
                        
                        {record.wasHandoffAppropriate ? (
                          <div className="flex items-center gap-1 text-blue-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Appropriate Handoff
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-orange-600 text-sm">
                            <XCircle className="w-4 h-4" />
                            Preventable
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Complexity: {record.complexity || 'unknown'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {expandedCards.has(record.conversationId) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedCards.has(record.conversationId) && (
                  <div className="border-t bg-gray-50">
                    <div className="p-6 space-y-6">
                      {/* User Intent Analysis */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                          <Target className="w-5 h-5 text-blue-600" />
                          User Intent Analysis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Primary Intent:</span>
                            <p className="text-gray-600">{record.intentCategory}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Specific Goal:</span>
                            <p className="text-gray-600">{record.userIntent}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Complexity:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(record.complexity)}`}>
                              {record.complexity}
                            </span>
                          </div>
                        </div>
                      </div>


                      {/* Gap Classification */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          Gap Classification
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">{record.gapDescription}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(record.gapSeverity)}`}>
                            {record.gapSeverity} severity
                          </span>
                        </div>
                      </div>


                      {/* Improvement Recommendations */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Improvement Recommendations
                        </h4>
                        
                        {record.immediateActions?.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Immediate Actions:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {record.immediateActions.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {record.toolDevelopment?.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Future Tool Development:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {record.toolDevelopment.map((tool, index) => (
                                <li key={index}>{tool}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {record.knowledgeImprovements?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Knowledge Base Improvements:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {record.knowledgeImprovements.map((improvement, index) => (
                                <li key={index}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Handoff Assessment */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                          <Users className="w-5 h-5 text-indigo-600" />
                          Handoff Assessment
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">{record.reasoning}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {record.wasHandoffAppropriate ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm">Handoff Appropriate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.couldBeAutomated ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm">Could be Automated</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(record.automationComplexity)}`}>
                            {record.automationComplexity} complexity
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GapAnalysisPage;