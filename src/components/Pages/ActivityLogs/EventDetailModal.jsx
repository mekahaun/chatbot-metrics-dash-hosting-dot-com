"use client";

import React, { useState } from "react";
import { format, parseISO } from "date-fns";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  Copy,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Brain,
  Zap,
  Package,
  Shield,
  Sparkles,
  MessageSquare,
  Bot,
  Users,
  Database,
  Search,
  Wrench,
  FileJson,
  Clock,
  Hash,
  Inbox,
  Download,
  FileText,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

const JsonViewer = ({ data, title, icon }) => {
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-gray-900 overflow-x-auto">
          <pre className="text-xs text-gray-300 font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const LayerSection = ({ title, icon, color, data }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data) return null;

  // Helper function to render layer-specific content
  const renderLayerContent = () => {
    // Planning Layer
    if (data.tools_selected || data.rag_queries || data.web_pages || data.planSummary || 
        data.intent_identified || data.intent_confidence) {
      return (
        <>
          {/* Intent Information */}
          {(data.intent_identified || data.intent_confidence !== undefined) && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Intent Detection</h4>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                {data.intent_identified && data.intent_identified.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-600">Identified Intents:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(Array.isArray(data.intent_identified) ? data.intent_identified : [data.intent_identified]).map((intent, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {intent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.intent_confidence !== undefined && data.intent_confidence !== null && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-600">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[150px]">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, data.intent_confidence * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-700 font-medium">
                      {(data.intent_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {data.planSummary && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">AI Plan</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {String(data.planSummary || '')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          
          {data.tools_selected && data.tools_selected.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tools Selected</h4>
              <div className="grid grid-cols-1 gap-2">
                {data.tools_selected.map((tool, index) => (
                  <div key={index} className="flex items-start space-x-2 bg-gray-50 rounded-lg p-2">
                    <Wrench className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700">{tool.name}</span>
                      {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                          {Object.entries(tool.parameters).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {data.rag_queries && data.rag_queries.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Knowledge Base Queries</h4>
              <div className="space-y-1">
                {data.rag_queries.map((query, index) => (
                  <div key={index} className="flex items-start space-x-2 bg-gray-50 rounded-lg p-2">
                    <Database className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-600">{query}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {data.web_pages && data.web_pages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Web Pages to Search</h4>
              <div className="space-y-1">
                {data.web_pages.map((page, index) => (
                  <div key={index} className="flex items-start space-x-2 bg-gray-50 rounded-lg p-2">
                    <Search className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-600">{page}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }
    
    // Execution Results
    if (data.tool_results || data.rag_results || data.web_search_results) {
      return (
        <>
          {data.tool_results && Object.keys(data.tool_results).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tool Execution Results</h4>
              <div className="space-y-2">
                {Object.entries(data.tool_results).map(([tool, result], index) => {
                  // Special handling for website_diagnostic tool
                  if (tool === 'website_diagnostic' && typeof result === 'object') {
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-sm text-gray-700 mb-2">{tool}</div>
                        <div className="space-y-2 text-xs">
                          {result.status && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Status:</span>
                              <span className={`px-2 py-1 rounded ${
                                result.status === 'healthy' ? 'bg-green-100 text-green-700' :
                                result.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>{result.status}</span>
                            </div>
                          )}
                          {result.ssl && (
                            <div><span className="font-medium">SSL:</span> {result.ssl.valid ? '✅ Valid' : '❌ Invalid'} (expires: {result.ssl.expiresAt})</div>
                          )}
                          {result.dns && (
                            <div><span className="font-medium">DNS:</span> {result.dns.resolved ? '✅ Resolved' : '❌ Not resolved'} - {result.dns.records?.A?.join(', ')}</div>
                          )}
                          {result.http && (
                            <div><span className="font-medium">HTTP:</span> {result.http.reachable ? '✅ Reachable' : '❌ Unreachable'}</div>
                          )}
                          {result.https && (
                            <div><span className="font-medium">HTTPS:</span> {result.https.reachable ? '✅ Reachable' : '❌ Unreachable'}</div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  // Default rendering for other tools
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-sm text-gray-700 mb-1">{tool}</div>
                      <div className="text-xs text-gray-600 whitespace-pre-wrap">
                        {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {data.rag_results && data.rag_results.length > 0 && (() => {
            const [showAllResults, setShowAllResults] = React.useState(false);
            const resultsToShow = showAllResults ? data.rag_results : data.rag_results.slice(0, 3);
            const hasMore = data.rag_results.length > 3;
            
            return (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Knowledge Base Results ({data.rag_results.length} total)
                </h4>
                <div className="space-y-2">
                  {resultsToShow.map((result, index) => {
                  // Extract title and content from the result object - content is in metadata.content
                  const title = result?.metadata?.title || result?.title || `Result ${index + 1}`;
                  const content = result?.metadata?.content || result?.content || result?.text || 
                                (typeof result === 'string' ? result : '');
                  const score = result?.score || result?.relevance || 0;
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      {/* Title */}
                      {title && (
                        <h5 className="text-sm font-semibold text-gray-800 mb-2">
                          <Database className="w-4 h-4 inline-block mr-1 text-gray-500" />
                          {title}
                        </h5>
                      )}
                      
                      {/* Content */}
                      <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {content || 'No content available'}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Score/Relevance */}
                      {score > 0 && (
                        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500">Relevance:</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${score * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-600">{(score * 100).toFixed(1)}%</div>
                        </div>
                      )}
                      
                      {/* Metadata if available */}
                      {result?.metadata?.source && (
                        <div className="text-xs text-gray-400 mt-2">
                          Source: {result.metadata.source}
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
                
                {/* Show More/Less Button */}
                {hasMore && (
                  <button
                    onClick={() => setShowAllResults(!showAllResults)}
                    className="mt-3 flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAllResults ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Show {data.rag_results.length - 3} More Results</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })()}
          
          {data.web_search_results && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Web Search Results</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {typeof data.web_search_results === 'object' 
                      ? JSON.stringify(data.web_search_results, null, 2) 
                      : data.web_search_results}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          
          {/* Search Results from execution_results */}
          {data.search_results && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Search Results</h4>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                {data.search_results.result && (
                  <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {data.search_results.result}
                    </ReactMarkdown>
                  </div>
                )}
                {data.search_results.instruction && (
                  <div className="mt-3 pt-3 border-t border-indigo-200">
                    <div className="text-xs font-medium text-gray-600 mb-1">Search Instruction:</div>
                    <div className="text-xs text-gray-600 italic">{data.search_results.instruction}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );
    }
    
    // Synthesis Layer
    if (data.content || data.responses || data.context_quality !== undefined || data.handoff !== undefined) {
      return (
        <>
          {data.content && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Synthesized Response</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {String(data.content || '')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          
          {/* Context Quality and Handoff Details */}
          {(data.context_quality !== undefined || data.handoff !== undefined) && (
            <div className={data.content ? 'mt-3' : ''}>
              <div className="grid grid-cols-2 gap-3">
                {data.context_quality !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Context Quality</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div 
                          className={`h-2 rounded-full ${
                            data.context_quality >= 8 ? 'bg-green-500' :
                            data.context_quality >= 5 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, data.context_quality * 10)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{data.context_quality}/10</span>
                    </div>
                  </div>
                )}
                
                {data.handoff !== undefined && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">Handoff Decision</div>
                    <div className="flex items-center space-x-2">
                      {data.handoff ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      <span className={`text-sm font-semibold ${data.handoff ? 'text-amber-600' : 'text-green-600'}`}>
                        {data.handoff ? 'Handoff Required' : 'No Handoff'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Handoff Details */}
              {data.handoff && (data.handoff_team || data.handoff_reason) && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  {data.handoff_team && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-gray-700">Team:</span>
                      <span className="text-sm text-gray-800">{data.handoff_team}</span>
                    </div>
                  )}
                  {data.handoff_reason && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Reason:</span> {data.handoff_reason}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {data.responses && data.responses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Response Messages</h4>
              <div className="space-y-2">
                {data.responses.map((response, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {typeof response === 'object' && response.content ? response.content : 
                         typeof response === 'string' ? response : 
                         JSON.stringify(response, null, 2)}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }
    
    // Judge Layer - Render feedback field properly from raw_response.feedback
    if (data.evaluation || data.feedback || data.raw_response?.feedback || data.handoff_needed !== undefined) {
      return (
        <>
          {/* Render feedback from raw_response.feedback (primary field) */}
          {(data.raw_response?.feedback || data.feedback) && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Judge Feedback</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {String(data.raw_response?.feedback || data.feedback || '')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          
          {/* Also render evaluation if it exists */}
          {data.evaluation && (
            <div className={data.feedback ? 'mt-3' : ''}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quality Evaluation</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {String(data.evaluation || '')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          
          {data.handoff_needed !== undefined && (
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Handoff Required:</span>
                <span className={`text-sm font-semibold ${data.handoff_needed ? 'text-amber-600' : 'text-green-600'}`}>
                  {data.handoff_needed ? 'Yes' : 'No'}
                </span>
              </div>
              {data.handoff_team && data.handoff_team !== 'none' && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Team: {data.handoff_team}</span>
                </div>
              )}
            </div>
          )}
        </>
      );
    }
    
    // Beautification Layer
    if (data.messages || data.closeChat !== undefined || data.handoff) {
      return (
        <>
          {data.messages && data.messages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Final Messages</h4>
              <div className="space-y-2">
                {data.messages.map((message, index) => (
                  <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {typeof message === 'object' && message.content ? message.content : 
                         typeof message === 'string' ? message : 
                         JSON.stringify(message, null, 2)}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(data.handoff || data.closeChat !== undefined) && (
            <div className="flex items-center space-x-6 mt-3">
              {data.handoff && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600">Handoff Executed</span>
                  {data.handoff_team && (
                    <span className="text-sm text-gray-600">to {data.handoff_team}</span>
                  )}
                </div>
              )}
              {data.closeChat && (
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Chat Closed</span>
                </div>
              )}
            </div>
          )}
        </>
      );
    }
    
    // For any other data structure, render it properly
    if (typeof data === 'string') {
      return (
        <div className="text-sm text-gray-600 prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data}
          </ReactMarkdown>
        </div>
      );
    }
    
    // For objects with specific properties, render them nicely
    if (typeof data === 'object') {
      const entries = Object.entries(data).filter(([key, value]) => 
        value !== null && value !== undefined && 
        !['tools_selected', 'rag_queries', 'web_pages', 'planSummary', 
         'tool_results', 'rag_results', 'web_search_results',
         'content', 'responses', 'evaluation', 'handoff_needed', 
         'messages', 'closeChat', 'handoff'].includes(key)
      );
      
      if (entries.length > 0) {
        return (
          <div className="space-y-2">
            {entries.map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-sm text-gray-700">
                  {typeof value === 'object' ? (
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {String(value)}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }
    }
    
    return null;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between px-4 py-3 ${color} cursor-pointer hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {icon}
          <span className="font-medium">{title}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {renderLayerContent()}
        </div>
      )}
    </div>
  );
};

const EventDetailModal = ({ event, onClose }) => {
  const [downloadingLog, setDownloadingLog] = useState(false);

  if (!event) return null;

  const getEventIcon = () => {
    switch (event.event_code) {
      case "newConversationCreated":
        return <MessageSquare className="w-5 h-5" />;
      case "messagesProcessed":
        return <Bot className="w-5 h-5" />;
      case "handoffOccurred":
        return <Users className="w-5 h-5" />;
      case "CONVERSATION_RESOLVED":
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getEventColor = () => {
    switch (event.event_code) {
      case "newConversationCreated":
        return "bg-blue-100 text-blue-700";
      case "messagesProcessed":
        return "bg-green-100 text-green-700";
      case "handoffOccurred":
        return "bg-amber-100 text-amber-700";
      case "CONVERSATION_RESOLVED":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Function to handle log file download
  const handleDownloadLog = async () => {
    if (!event.log_file_s3_uri && !event.logFileS3URI) {
      alert("No log file available for this event");
      return;
    }

    setDownloadingLog(true);
    try {
      const s3Uri = event.log_file_s3_uri || event.logFileS3URI;
      const encodedS3Uri = encodeURIComponent(s3Uri);
      const response = await fetch(`/api/logs/download-url?s3Uri=${encodedS3Uri}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data = await response.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Error downloading log:', error);
      alert('Failed to download log file');
    } finally {
      setDownloadingLog(false);
    }
  };

  // Check if log file is available for this event type
  const hasLogFile = event.event_code === 'messagesProcessed' || 
                     event.event_code === 'handoffOccurred' ||
                     event.event_code === 'silent_handoff_occurred';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getEventColor()}`}>
              {getEventIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                {event.title || event.event_code}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-gray-500 mb-1">
                <Hash className="w-4 h-4" />
                <span className="text-xs">Conversation ID</span>
              </div>
              <p className="font-semibold text-gray-900">{event.conversation_id}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Timestamp</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                {event.timestamp && format(parseISO(event.timestamp), "MMM dd, HH:mm:ss")}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-gray-500 mb-1">
                <Inbox className="w-4 h-4" />
                <span className="text-xs">Inbox</span>
              </div>
              <p className="font-semibold text-gray-900">{event.inbox_name}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-gray-500 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">Messages</span>
              </div>
              <p className="font-semibold text-gray-900">{event.message_count || 0}</p>
            </div>
          </div>

          {/* User Messages */}
          {event.user_messages && event.user_messages.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>User Messages</span>
              </h3>
              <div className="space-y-2">
                {event.user_messages.map((msg, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-gray-800">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(parseISO(msg.timestamp), "HH:mm:ss")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Conversation Details */}
          {event.event_code === "newConversationCreated" && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>New Conversation Details</span>
              </h3>
              
              <div className="space-y-3">
                {/* Contact Information */}
                {(event.contact || event.contact_info) && (() => {
                  const contact = event.contact || event.contact_info;
                  return (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">Contact Information:</span>
                      <div className="bg-white rounded p-3 space-y-2">
                        {contact.name && (
                          <div className="flex items-start space-x-2">
                            <span className="text-xs font-medium text-gray-500 min-w-[80px]">Name:</span>
                            <span className="text-sm text-gray-800">{contact.name}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-start space-x-2">
                            <span className="text-xs font-medium text-gray-500 min-w-[80px]">Email:</span>
                            <span className="text-sm text-gray-800">{contact.email}</span>
                          </div>
                        )}
                        {contact.phone_number && (
                          <div className="flex items-start space-x-2">
                            <span className="text-xs font-medium text-gray-500 min-w-[80px]">Phone:</span>
                            <span className="text-sm text-gray-800">{contact.phone_number}</span>
                          </div>
                        )}
                        {contact.location?.country && (
                          <div className="flex items-start space-x-2">
                            <span className="text-xs font-medium text-gray-500 min-w-[80px]">Location:</span>
                            <span className="text-sm text-gray-800">
                              {[contact.location.city, contact.location.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Channel Information */}
                {(event.channel || event.channel_info) && (() => {
                  const channel = event.channel || event.channel_info;
                  return (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-2">Channel Information:</span>
                      <div className="bg-white rounded p-3 space-y-2">
                        <div className="flex items-start space-x-2">
                          <span className="text-xs font-medium text-gray-500 min-w-[80px]">Type:</span>
                          <span className="text-sm text-gray-800">{channel.type || channel.channel_type || 'Unknown'}</span>
                        </div>
                        {channel.source_id && (
                          <div className="flex items-start space-x-2">
                            <span className="text-xs font-medium text-gray-500 min-w-[80px]">Source:</span>
                            <span className="text-sm text-gray-800">{channel.source_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                
                {/* Business Context */}
                {event.business_context && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-2">Business Context:</span>
                    <div className="bg-white rounded p-3 space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="text-xs font-medium text-gray-500 min-w-[80px]">Time:</span>
                        <span className="text-sm text-gray-800">
                          {event.business_context.created_during_business_hours || event.business_context.business_hours ? 'Business Hours' : 'After Hours'}
                          {event.business_context.is_weekend && ' (Weekend)'}
                        </span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-xs font-medium text-gray-500 min-w-[80px]">Hour:</span>
                        <span className="text-sm text-gray-800">{event.business_context.hour_of_day}:00</span>
                      </div>
                      {event.business_context.day_of_week && (
                        <div className="flex items-start space-x-2">
                          <span className="text-xs font-medium text-gray-500 min-w-[80px]">Day:</span>
                          <span className="text-sm text-gray-800">{event.business_context.day_of_week}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Initial Message */}
                {event.initial_message && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-2">Initial Message:</span>
                    <div className="bg-white rounded p-3">
                      <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {typeof event.initial_message === 'object' 
                            ? event.initial_message.content || ''
                            : event.initial_message}
                        </ReactMarkdown>
                      </div>
                      {typeof event.initial_message === 'object' && event.initial_message.word_count && (
                        <div className="text-xs text-gray-500 mt-2">
                          Words: {event.initial_message.word_count} | Characters: {event.initial_message.character_count || 0}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resolution Details for CONVERSATION_RESOLVED events */}
          {event.event_code === "CONVERSATION_RESOLVED" && (
            <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                <span>Resolution Details</span>
              </h3>
              
              <div className="space-y-3">
                {event.resolution_method && (
                  <div className="flex items-start space-x-3">
                    <span className="text-sm font-medium text-gray-600 min-w-[140px]">Resolution Method:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.resolution_method === 'ai_only' ? 'bg-green-100 text-green-700' :
                      event.resolution_method === 'human_assisted' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.resolution_method === 'ai_only' ? 'AI Only' :
                       event.resolution_method === 'human_assisted' ? 'Human Assisted' :
                       event.resolution_method}
                    </span>
                  </div>
                )}
                
                {event.resolved_by && (
                  <div className="flex items-start space-x-3">
                    <span className="text-sm font-medium text-gray-600 min-w-[140px]">Resolved By:</span>
                    <span className="text-sm text-gray-800">
                      {event.resolved_by.name} ({event.resolved_by.type})
                    </span>
                  </div>
                )}
                
                {event.resolved_at && (
                  <div className="flex items-start space-x-3">
                    <span className="text-sm font-medium text-gray-600 min-w-[140px]">Resolved At:</span>
                    <span className="text-sm text-gray-800">
                      {format(parseISO(event.resolved_at), "MMM dd, yyyy HH:mm:ss")}
                    </span>
                  </div>
                )}
                
                {event.conversation_duration_minutes !== undefined && (
                  <div className="flex items-start space-x-3">
                    <span className="text-sm font-medium text-gray-600 min-w-[140px]">Duration:</span>
                    <span className="text-sm text-gray-800">
                      {event.conversation_duration_minutes} minutes
                    </span>
                  </div>
                )}
                
                {event.ai_resolution_summary && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <span className="text-sm font-medium text-gray-600 block mb-2">AI Summary:</span>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-sm text-gray-700">{event.ai_resolution_summary}</p>
                    </div>
                  </div>
                )}
                
                {event.resolution_summary && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Resolution Details:</span>
                    <div className="bg-white rounded-lg p-3 space-y-2">
                      {event.resolution_summary.ai_generated_summary && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Summary:</span>
                          <p className="text-sm text-gray-700">{event.resolution_summary.ai_generated_summary}</p>
                        </div>
                      )}
                      {event.resolution_summary.primary_intent && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Primary Intent:</span>
                          <p className="text-sm text-gray-700">{event.resolution_summary.primary_intent}</p>
                        </div>
                      )}
                      {event.resolution_summary.issues_resolved && event.resolution_summary.issues_resolved.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">Issues Resolved:</span>
                          <ul className="text-sm text-gray-700 list-disc list-inside">
                            {event.resolution_summary.issues_resolved.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Layers */}
          <div className="space-y-4">
            {event.planning_layer && (
              <LayerSection
                title="Planning Layer"
                icon={<Brain className="w-4 h-4" />}
                color="bg-purple-50 text-purple-700"
                data={event.planning_layer}
              />
            )}
            
            {event.execution_results && (
              <LayerSection
                title="Execution Layer"
                icon={<Zap className="w-4 h-4" />}
                color="bg-yellow-50 text-yellow-700"
                data={event.execution_results}
              />
            )}
            
            {event.synthesis_layer && (
              <LayerSection
                title="Synthesis Layer"
                icon={<Package className="w-4 h-4" />}
                color="bg-blue-50 text-blue-700"
                data={event.synthesis_layer}
              />
            )}
            
            {event.judge_layer && (
              <LayerSection
                title="Judge Layer"
                icon={<Shield className="w-4 h-4" />}
                color="bg-green-50 text-green-700"
                data={event.judge_layer}
              />
            )}
            
            {event.beautification_layer && (
              <LayerSection
                title="Beautification Layer"
                icon={<Sparkles className="w-4 h-4" />}
                color="bg-pink-50 text-pink-700"
                data={event.beautification_layer}
              />
            )}
          </div>

          {/* Processing Metadata */}
          {event.processing_metadata && (
            <div className="mt-6">
              <JsonViewer
                data={event.processing_metadata}
                title="Processing Metadata"
                icon={<Clock className="w-4 h-4 text-gray-500" />}
              />
            </div>
          )}

          {/* Full Event JSON - Collapsed by default */}
          <div className="mt-6">
            <JsonViewer
              data={event}
              title="Complete Event Data"
              icon={<FileJson className="w-4 h-4 text-gray-500" />}
            />
          </div>
        </div>

        {/* Modal Footer with Log Actions */}
        {hasLogFile && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center space-x-3">
              {/* View Log Button */}
              <button
                onClick={async () => {
                  const s3Uri = event.log_file_s3_uri || event.logFileS3URI;
                  if (s3Uri) {
                    try {
                      const encodedS3Uri = encodeURIComponent(s3Uri);
                      const response = await fetch(`/api/logs/content?s3Uri=${encodedS3Uri}`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                      });
                      const data = await response.json();
                      if (data.content) {
                        // Open log viewer in new tab
                        const viewerWindow = window.open('', '_blank');
                        viewerWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <title>Log Viewer - ${event.conversation_id}</title>
                            <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
                            <style>
                              body { 
                                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
                                background: #1e1e1e; 
                                color: #d4d4d4; 
                                padding: 20px;
                                margin: 0;
                              }
                              .header {
                                background: #2d2d30;
                                padding: 15px;
                                margin: -20px -20px 20px -20px;
                                border-bottom: 1px solid #464647;
                              }
                              .header h1 { 
                                margin: 0; 
                                color: #cccccc;
                                font-size: 18px;
                              }
                              .header .meta {
                                color: #858585;
                                font-size: 12px;
                                margin-top: 5px;
                              }
                              .search-bar {
                                margin: 20px 0;
                                display: flex;
                                gap: 10px;
                              }
                              .search-bar input {
                                flex: 1;
                                padding: 8px 12px;
                                background: #3c3c3c;
                                border: 1px solid #464647;
                                color: #cccccc;
                                border-radius: 4px;
                              }
                              .search-bar button {
                                padding: 8px 16px;
                                background: #007acc;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                              }
                              .search-bar button:hover {
                                background: #005a9e;
                              }
                              pre { 
                                background: #2d2d30; 
                                padding: 15px; 
                                border-radius: 5px; 
                                overflow-x: auto;
                                border: 1px solid #464647;
                                line-height: 1.5;
                              }
                              .highlight {
                                background: #515c6a;
                                color: #ffcc00;
                                padding: 2px 4px;
                                border-radius: 3px;
                              }
                              .line-number {
                                color: #858585;
                                margin-right: 15px;
                                user-select: none;
                              }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h1>Log Viewer - Conversation ${event.conversation_id}</h1>
                              <div class="meta">
                                Event: ${event.event_code} | Time: ${event.timestamp}
                              </div>
                            </div>
                            <div class="search-bar">
                              <input type="text" id="searchInput" placeholder="Search in log..." />
                              <button onclick="searchLog()">Search</button>
                              <button onclick="clearSearch()">Clear</button>
                            </div>
                            <pre id="logContent">${typeof data.content === 'string' ? 
                              data.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : 
                              JSON.stringify(data.content, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;')
                            }</pre>
                            <script>
                              function searchLog() {
                                const searchTerm = document.getElementById('searchInput').value;
                                const content = document.getElementById('logContent');
                                const text = content.textContent;
                                
                                if (!searchTerm) {
                                  content.innerHTML = text;
                                  return;
                                }
                                
                                const regex = new RegExp(searchTerm, 'gi');
                                const highlighted = text.replace(regex, match => 
                                  '<span class="highlight">' + match + '</span>'
                                );
                                content.innerHTML = highlighted;
                              }
                              
                              function clearSearch() {
                                document.getElementById('searchInput').value = '';
                                const content = document.getElementById('logContent');
                                content.innerHTML = content.textContent;
                              }
                              
                              // Add line numbers
                              const content = document.getElementById('logContent');
                              const lines = content.textContent.split('\\n');
                              const numberedLines = lines.map((line, i) => 
                                '<span class="line-number">' + String(i + 1).padStart(4, ' ') + '</span>' + line
                              ).join('\\n');
                              content.innerHTML = numberedLines;
                            </script>
                          </body>
                          </html>
                        `);
                        viewerWindow.document.close();
                      }
                    } catch (error) {
                      console.error('Error viewing log:', error);
                      alert('Failed to load log file');
                    }
                  }
                }}
                disabled={!event.log_file_s3_uri && !event.logFileS3URI}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  event.log_file_s3_uri || event.logFileS3URI
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>View Log</span>
              </button>
              
              {/* Download Log Button */}
              <button
                onClick={handleDownloadLog}
                disabled={downloadingLog || (!event.log_file_s3_uri && !event.logFileS3URI)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  event.log_file_s3_uri || event.logFileS3URI
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {downloadingLog ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
            
            {!(event.log_file_s3_uri || event.logFileS3URI) && (
              <p className="text-xs text-gray-500 mt-2">
                Log file not available for this event
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailModal;