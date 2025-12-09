"use client";

import React, { useState, useEffect } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Code2,
  Database,
  FileText,
  Filter,
  Hash,
  Inbox,
  Layers,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Zap,
  Brain,
  Bot,
  Workflow,
  GitBranch,
  Package,
  Shield,
  XCircle,
  Info,
} from "lucide-react";
import { useAppContext } from "@/components/context/AppContext";
import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";
import { getFullUrl, getRoutes } from "@/utils";
import EventDetailModal from "./EventDetailModal";
import ConversationTimeline from "./ConversationTimeline";

const getEventIcon = (eventCode) => {
  switch (eventCode) {
    case "newConversationCreated":
      return <MessageSquare className="w-4 h-4" />;
    case "messagesProcessed":
      return <Bot className="w-4 h-4" />;
    case "handoffOccurred":
      return <Users className="w-4 h-4" />;
    case "CONVERSATION_RESOLVED":
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getEventColor = (eventCode) => {
  switch (eventCode) {
    case "newConversationCreated":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "messagesProcessed":
      return "bg-green-100 text-green-700 border-green-200";
    case "handoffOccurred":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "CONVERSATION_RESOLVED":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const ActivityLogsV2 = () => {
  const { timePeriod } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchConversationId, setSearchConversationId] = useState("");
  const [selectedEventCode, setSelectedEventCode] = useState(null);
  const [expandedConversation, setExpandedConversation] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  const { activityLogsApiPath } = getRoutes();

  const fetchActivityLogs = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = `${activityLogsApiPath}?period=${timePeriod}&pageSize=20&page=${page}`;
      
      if (searchConversationId) {
        url += `&conversationId=${searchConversationId}`;
      }
      
      if (selectedEventCode) {
        url += `&eventCode=${selectedEventCode}`;
      }
      
      const endpoint = getFullUrl(url);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError(err.message || "Failed to fetch activity logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs(1);
  }, [timePeriod, searchConversationId, selectedEventCode]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchActivityLogs(1);
  };

  const handleConversationClick = (conversationId, activitySK) => {
    const expandKey = `${conversationId}-${activitySK}`;
    setExpandedConversation(expandedConversation === expandKey ? null : expandKey);
  };

  const handleEventClick = async (conversationId, eventSK, accountId) => {
    try {
      const endpoint = getFullUrl(
        `${getRoutes().activityDetailApiPath}?conversationId=${conversationId}&activitySK=${encodeURIComponent(eventSK)}&accountId=${accountId}`
      );
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setSelectedEvent(result.activityDetail);
      setShowEventModal(true);
    } catch (err) {
      console.error("Error fetching event details:", err);
    }
  };

  if (isLoading && !data) {
    return <LoadingSection />;
  }

  if (error) {
    return <ErrorSection />;
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchConversationId}
                onChange={(e) => setSearchConversationId(e.target.value)}
                placeholder="Search conversation ID..."
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </form>

            {/* Event Type Filter */}
            <select
              value={selectedEventCode || ""}
              onChange={(e) => setSelectedEventCode(e.target.value || null)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Events</option>
              <option value="newConversationCreated">New Conversations</option>
              <option value="messagesProcessed">Messages Processed</option>
              <option value="handoffOccurred">Handoffs</option>
              <option value="CONVERSATION_RESOLVED">Conversation Resolved</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {/* Refresh Button */}
            <button
              onClick={() => fetchActivityLogs(currentPage)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            {/* Clear Filters */}
            {(searchConversationId || selectedEventCode) && (
              <button
                onClick={() => {
                  setSearchConversationId("");
                  setSelectedEventCode(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {data?.activities.map((activity) => (
          <div
            key={`${activity.conversation_id}-${activity.SK}`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Activity Header */}
            <div
              onClick={() => handleConversationClick(activity.conversation_id, activity.SK)}
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Event Icon & Type */}
                  <div className={`p-2 rounded-lg border ${getEventColor(activity.event_code)}`}>
                    {getEventIcon(activity.event_code)}
                  </div>
                  
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">
                        Conversation #{activity.conversation_id}
                      </h3>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{activity.title}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Inbox className="w-3 h-3" />
                        <span>{activity.inbox_name}</span>
                      </div>
                      
                      {activity.message_count !== null && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MessageSquare className="w-3 h-3" />
                          <span>{activity.message_count} messages</span>
                        </div>
                      )}
                      
                      {activity.handoff_team && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                          <Users className="w-3 h-3" />
                          <span>{activity.handoff_team}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timestamp & Expand Icon */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {format(parseISO(activity.timestamp), "HH:mm:ss")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {expandedConversation === `${activity.conversation_id}-${activity.SK}` ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Conversation Timeline */}
            {expandedConversation === `${activity.conversation_id}-${activity.SK}` && (
              <ConversationTimeline
                conversationId={activity.conversation_id}
                accountId={activity.account_id || 2}
                onEventClick={handleEventClick}
              />
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            onClick={() => fetchActivityLogs(currentPage - 1)}
            disabled={!data.pagination.hasPrevPage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {data.pagination.currentPage} of {data.pagination.totalPages}
          </span>
          
          <button
            onClick={() => fetchActivityLogs(currentPage + 1)}
            disabled={!data.pagination.hasNextPage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default ActivityLogsV2;