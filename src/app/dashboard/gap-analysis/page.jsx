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
  AlertOctagon
} from 'lucide-react';

const API_BASE_URL = 'https://w4f1hwfdia.execute-api.us-east-1.amazonaws.com/prod/gap-analysis';

const GapAnalysisPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  
  // Filter states
  const [dateFilter, setDateFilter] = useState('');
  const [conversationIdFilter, setConversationIdFilter] = useState('');
  
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
  const fetchGapAnalysisData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = API_BASE_URL;
      const params = new URLSearchParams();
      
      if (dateFilter) {
        params.append('date', dateFilter);
      }
      
      if (conversationIdFilter) {
        params.append('conversation_id', conversationIdFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.records);
        setQueryInfo(data.query);
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
    fetchGapAnalysisData();
  }, [dateFilter, conversationIdFilter]);

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

  // Calculate stats
  const stats = {
    total: records.length,
    canBeAutomated: records.filter(r => r.canBeAutomated).length,
    highSeverity: records.filter(r => r.severity === 'high' || r.severity === 'critical').length,
    toolRequirements: records.filter(r => r.gapType === 'tool_requirement').length,
    knowledgeGaps: records.filter(r => r.gapType === 'knowledge_gap').length
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
                Showing results for: <span className="font-medium">{queryInfo.filterType.replace('_', ' ')}</span>
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
                <p className="text-sm font-medium text-gray-600">Can Automate</p>
                <p className="text-3xl font-bold text-green-600">{stats.canBeAutomated}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Severity</p>
                <p className="text-3xl font-bold text-red-600">{stats.highSeverity}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tool Needs</p>
                <p className="text-3xl font-bold text-purple-600">{stats.toolRequirements}</p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Knowledge Gaps</p>
                <p className="text-3xl font-bold text-orange-600">{stats.knowledgeGaps}</p>
              </div>
              <BookOpen className="w-8 h-8 text-orange-600" />
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
                            openConversation(record.fullRecord?.conversation_url, record.conversationId);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Chat
                        </button>
                        
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(record.severity)}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {record.severity}
                        </div>
                        
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-xs font-medium text-gray-700">
                          {getGapTypeIcon(record.gapType)}
                          {record.gapType.replace('_', ' ')}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{record.userQuery}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Bot className="w-4 h-4" />
                          {record.originatingAgent}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(record.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        {record.canBeAutomated && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Can be automated
                          </div>
                        )}
                        
                        {record.knowledgePriority && (
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(record.knowledgePriority)}`}>
                            Knowledge: {record.knowledgePriority}
                          </div>
                        )}
                        
                        {record.toolPriority && (
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(record.toolPriority)}`}>
                            Tool: {record.toolPriority}
                          </div>
                        )}
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
                            <p className="text-gray-600">{record.fullRecord.user_intent?.primary_intent}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Specific Goal:</span>
                            <p className="text-gray-600">{record.fullRecord.user_intent?.specific_goal}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Complexity:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(record.fullRecord.user_intent?.complexity_level)}`}>
                              {record.fullRecord.user_intent?.complexity_level}
                            </span>
                          </div>
                        </div>
                        {record.fullRecord.user_intent?.user_context && (
                          <div className="mt-3 col-span-full">
                            <span className="font-medium text-gray-700">User Context:</span>
                            <p className="text-gray-600 text-sm">{record.fullRecord.user_intent.user_context}</p>
                          </div>
                        )}
                      </div>

                      {/* Information Completeness */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                          <Info className="w-5 h-5 text-blue-600" />
                          Information Completeness
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Information Available:</span>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(record.fullRecord.information_completeness_analysis?.information_available_score || 0) * 10}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{record.fullRecord.information_completeness_analysis?.information_available_score}/10</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Information Needed:</span>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-orange-600 h-2 rounded-full" 
                                style={{ width: `${(record.fullRecord.information_completeness_analysis?.information_needed_score || 0) * 10}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{record.fullRecord.information_completeness_analysis?.information_needed_score}/10</span>
                          </div>
                        </div>
                        {record.fullRecord.information_completeness_analysis?.critical_missing_pieces && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Critical Missing Pieces:</span>
                            <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                              {record.fullRecord.information_completeness_analysis.critical_missing_pieces.map((piece, index) => (
                                <li key={index}>{piece}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Gap Classification */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          Gap Classification
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">{record.fullRecord.gap_classification?.gap_description}</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(record.fullRecord.gap_classification?.gap_severity)}`}>
                            {record.fullRecord.gap_classification?.gap_severity} severity
                          </span>
                        </div>
                      </div>

                      {/* Tool Requirements */}
                      {record.fullRecord.tool_requirement_analysis?.tool_would_help && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                            <Settings className="w-5 h-5 text-purple-600" />
                            Suggested Tool: {record.fullRecord.tool_requirement_analysis?.suggested_tool_name}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">{record.fullRecord.tool_requirement_analysis?.tool_purpose}</p>
                          
                          {record.fullRecord.tool_requirement_analysis?.information_tool_should_provide?.length > 0 && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-gray-700">Information this tool should provide:</span>
                              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                                {record.fullRecord.tool_requirement_analysis.information_tool_should_provide.map((info, index) => (
                                  <li key={index}>{info}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(record.fullRecord.tool_requirement_analysis?.implementation_priority)}`}>
                            {record.fullRecord.tool_requirement_analysis?.implementation_priority} priority
                          </span>
                        </div>
                      )}

                      {/* Knowledge Gap */}
                      {record.fullRecord.knowledge_gap_analysis?.knowledge_gap_exists && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                            <BookOpen className="w-5 h-5 text-orange-600" />
                            Knowledge Gap: {record.fullRecord.knowledge_gap_analysis?.missing_knowledge_category}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">{record.fullRecord.knowledge_gap_analysis?.specific_information_needed}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                              {record.fullRecord.knowledge_gap_analysis?.suggested_content_type}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(record.fullRecord.knowledge_gap_analysis?.content_priority)}`}>
                              {record.fullRecord.knowledge_gap_analysis?.content_priority} priority
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Improvement Recommendations */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          Improvement Recommendations
                        </h4>
                        
                        {record.fullRecord.improvement_recommendations?.immediate_actions?.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Immediate Actions:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {record.fullRecord.improvement_recommendations.immediate_actions.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {record.fullRecord.improvement_recommendations?.future_tool_development?.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Future Tool Development:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {record.fullRecord.improvement_recommendations.future_tool_development.map((tool, index) => (
                                <li key={index}>{tool}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {record.fullRecord.improvement_recommendations?.knowledge_base_improvements?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Knowledge Base Improvements:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {record.fullRecord.improvement_recommendations.knowledge_base_improvements.map((improvement, index) => (
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
                        <p className="text-gray-600 text-sm mb-3">{record.fullRecord.handoff_assessment?.reasoning}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {record.fullRecord.handoff_assessment?.was_handoff_appropriate ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm">Handoff Appropriate</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {record.fullRecord.handoff_assessment?.could_be_automated ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm">Could be Automated</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(record.fullRecord.handoff_assessment?.automation_complexity)}`}>
                            {record.fullRecord.handoff_assessment?.automation_complexity} complexity
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
      </div>
    </div>
  );
};

export default GapAnalysisPage;