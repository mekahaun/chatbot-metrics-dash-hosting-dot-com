"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Activity,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Eye,
  FileJson,
  GitBranch,
  Layers,
  MessageSquare,
  Package,
  Search,
  Shield,
  Sparkles,
  Users,
  Workflow,
  Zap,
  AlertCircle,
  ChevronRight,
  Lock,
  AlertTriangle,
  User,
  Image,
  Pencil,
} from "lucide-react";
import { getFullUrl, getRoutes } from "@/utils";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";

const getLayerIcon = (layerName) => {
  switch (layerName) {
    case "planning":
      return <Brain className="w-4 h-4" />;
    case "execution":
      return <Zap className="w-4 h-4" />;
    case "synthesis":
      return <Package className="w-4 h-4" />;
    case "judge":
      return <Shield className="w-4 h-4" />;
    case "beautification":
      return <Sparkles className="w-4 h-4" />;
    default:
      return <Layers className="w-4 h-4" />;
  }
};

const getLayerColor = (layerName) => {
  switch (layerName) {
    case "planning":
      return "text-purple-600 bg-purple-50";
    case "execution":
      return "text-yellow-600 bg-yellow-50";
    case "synthesis":
      return "text-blue-600 bg-blue-50";
    case "judge":
      return "text-green-600 bg-green-50";
    case "beautification":
      return "text-pink-600 bg-pink-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

const getMessageTypeInfo = (message) => {
  // Check if it's a system event (message_type === 2)
  if (message.message_type === 2) {
    return {
      type: 'system',
      label: 'System Event',
      icon: <AlertCircle className="w-3 h-3" />,
      bgColor: 'bg-gray-800',
      textColor: 'text-gray-300',
      borderColor: 'border-gray-700',
      labelColor: 'text-gray-400'
    };
  }
  
  // Check if it's an internal/private note
  if (message.private) {
    return {
      type: 'internal',
      label: 'Internal Note',
      icon: <Lock className="w-3 h-3" />,
      bgColor: 'bg-amber-900',
      textColor: 'text-amber-100',
      borderColor: 'border-amber-800',
      labelColor: 'text-amber-400'
    };
  }
  
  // Check if it's from a customer (incoming)
  if (message.message_type === 0) {
    return {
      type: 'customer',
      label: message.sender?.name || 'Customer',
      icon: <User className="w-3 h-3" />,
      bgColor: 'bg-slate-800',
      textColor: 'text-slate-100',
      borderColor: 'border-slate-700',
      labelColor: 'text-slate-400'
    };
  }
  
  // Check if it's from an agent bot
  if (message.sender?.type === 'agent_bot') {
    return {
      type: 'bot',
      label: message.sender?.name || 'AI Assistant',
      icon: <Bot className="w-3 h-3" />,
      bgColor: 'bg-indigo-900',
      textColor: 'text-indigo-100',
      borderColor: 'border-indigo-800',
      labelColor: 'text-indigo-400'
    };
  }
  
  // Default to agent/user message
  return {
    type: 'agent',
    label: message.sender?.name || 'Agent',
    icon: <Users className="w-3 h-3" />,
    bgColor: 'bg-blue-900',
    textColor: 'text-blue-100',
    borderColor: 'border-blue-800',
    labelColor: 'text-blue-400'
  };
};

// Build a mapping of bot messages to events using timestamp proximity matching
// Multiple bot messages can map to the same event (AI can send multiple messages per event)
const buildMessageEventMapping = (chatHistory, events) => {
  const mapping = new Map(); // messageId -> event

  // Filter to events that represent AI responses
  // - messagesProcessed: regular AI responses
  // - handoffOccurred: AI handoff messages (e.g., "I'm transferring you to an agent")
  // - silent_handoff_occurred: silent handoff events
  const responseEvents = events.filter(e =>
    e.event_code === 'messagesProcessed' ||
    e.event_code === 'handoffOccurred' ||
    e.event_code === 'silent_handoff_occurred'
  );

  // Get all bot/outgoing messages sorted by timestamp (oldest first)
  const botMessages = chatHistory
    .filter(m => {
      if (m.message_type !== 1) return false;
      if (m.private) return false;
      const senderType = m.sender?.type?.toLowerCase() || '';
      return senderType === 'agent_bot' || senderType === 'bot' || senderType.includes('bot');
    })
    .sort((a, b) => a.created_at - b.created_at);

  // Sort events by timestamp (oldest first)
  const sortedEvents = [...responseEvents].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Debug logging
  console.log('[Message-Event Mapping Debug]', {
    totalChatMessages: chatHistory.length,
    botMessagesCount: botMessages.length,
    responseEventsCount: sortedEvents.length,
    botMessages: botMessages.map(m => ({
      id: m.id,
      sender: m.sender?.type,
      time: new Date(m.created_at * 1000).toISOString()
    })),
    events: sortedEvents.map(e => ({ SK: e.SK, code: e.event_code, time: e.timestamp }))
  });

  if (responseEvents.length === 0) {
    console.log('[Mapping] No response events found (messagesProcessed, handoffOccurred, etc.)');
    return mapping;
  }

  // For each bot message, find the best matching event by timestamp proximity
  // The event timestamp should be close to or slightly before the bot message timestamp
  // (event is created during processing, message is sent after)
  for (const botMsg of botMessages) {
    const botMsgTime = botMsg.created_at * 1000; // Convert to milliseconds

    let bestEvent = null;
    let bestTimeDiff = Infinity;

    for (const event of sortedEvents) {
      const eventTime = new Date(event.timestamp).getTime();

      // Event should be within 60 seconds BEFORE or 10 seconds AFTER the bot message
      // (processing happens, then message is sent)
      const timeDiff = botMsgTime - eventTime;

      // Valid range: event is 0-60 seconds before the message, or up to 10 seconds after
      if (timeDiff >= -10000 && timeDiff <= 60000) {
        if (Math.abs(timeDiff) < bestTimeDiff) {
          bestTimeDiff = Math.abs(timeDiff);
          bestEvent = event;
        }
      }
    }

    if (bestEvent) {
      mapping.set(botMsg.id, bestEvent);
    }
  }

  console.log('[Mapping Result]', {
    mappedCount: mapping.size,
    unmappedBotMessages: botMessages.length - mapping.size,
    mappings: Array.from(mapping.entries()).map(([msgId, event]) => ({
      messageId: msgId,
      eventSK: event.SK
    }))
  });

  return mapping;
};

// Simple lookup function that uses pre-built mapping
const findMatchingEventForMessage = (message, messageEventMap) => {
  // Must be outgoing message
  if (message.message_type !== 1) return null;
  // Must not be private
  if (message.private) return null;
  // Check if it's from a bot
  const senderType = message.sender?.type?.toLowerCase() || '';
  const isBot = senderType === 'agent_bot' || senderType === 'bot' || senderType.includes('bot');
  if (!isBot) return null;

  return messageEventMap.get(message.id) || null;
};

const ConversationTimeline = ({ conversationId, accountId = 2, onEventClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // Build message-to-event mapping once when data changes
  const messageEventMap = useMemo(() => {
    if (chatHistory.length === 0 || events.length === 0) {
      return new Map();
    }
    return buildMessageEventMapping(chatHistory, events);
  }, [chatHistory, events]);

  useEffect(() => {
    fetchConversationEvents();
  }, [conversationId]);
  
  useEffect(() => {
    if (showChat && chatHistory.length === 0) {
      fetchChatHistory();
    }
  }, [showChat]);

  const fetchConversationEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all events for this conversation
      const endpoint = getFullUrl(
        `${getRoutes().activityLogsApiPath}?conversationId=${conversationId}&period=L30D&pageSize=100`
      );
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setEvents(result.activities || []);
      
      // Fetch chat history from Chatwoot
      if (showChat) {
        fetchChatHistory();
      }
      
    } catch (err) {
      console.error("Error fetching conversation events:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchChatHistory = async () => {
    try {
      const endpoint = getFullUrl(`/chat-history?conversationId=${conversationId}&accountId=${accountId || 2}`);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.messages && Array.isArray(result.messages)) {
        // Sort messages by created_at (Unix timestamp)
        const sortedMessages = result.messages.sort((a, b) => 
          a.created_at - b.created_at
        );
        setChatHistory(sortedMessages);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 border-t border-gray-200">
        <LoadingSection />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border-t border-gray-200">
        <div className="text-red-600 text-sm">Error loading events: {error}</div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200">
      {/* Timeline Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Event Timeline</h3>
            <span className="text-sm text-gray-500">({events.length} events)</span>
          </div>
          
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showChat ? "Hide" : "Show"} Chat History</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Events Timeline */}
        <div className={`flex-1 p-6 ${showChat ? 'border-r border-gray-200' : ''}`}>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.SK} className="relative">
                {/* Timeline Line */}
                {index < events.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                
                {/* Event Item */}
                <div className="flex items-start space-x-4">
                  {/* Event Icon */}
                  <div className={`p-2.5 rounded-full border-2 border-white shadow-sm z-10 ${
                    event.event_code === 'newConversationCreated' 
                      ? 'bg-blue-100 text-blue-600' 
                      : event.event_code === 'messagesProcessed'
                      ? 'bg-green-100 text-green-600'
                      : event.event_code === 'CONVERSATION_RESOLVED'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {event.event_code === 'newConversationCreated' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : event.event_code === 'messagesProcessed' ? (
                      <Bot className="w-4 h-4" />
                    ) : event.event_code === 'CONVERSATION_RESOLVED' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(event.timestamp), "MMM dd, yyyy HH:mm:ss")}
                          </p>
                          
                          {/* Event Metadata */}
                          {event.message_count && (
                            <div className="flex items-center space-x-4 mt-3">
                              <span className="text-xs text-gray-600">
                                {event.message_count} message{event.message_count > 1 ? 's' : ''}
                              </span>
                              {event.handoff_team && (
                                <span className="text-xs text-blue-600">
                                  → {event.handoff_team}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Layer Indicators */}
                          {event.event_code === 'messagesProcessed' && (
                            <div className="flex items-center space-x-2 mt-3">
                              <span className="text-xs text-gray-500">Layers:</span>
                              <div className="flex items-center space-x-1">
                                {['planning', 'execution', 'synthesis', 'judge', 'beautification'].map((layer) => (
                                  <div
                                    key={layer}
                                    className={`p-1 rounded ${getLayerColor(layer)}`}
                                    title={layer}
                                  >
                                    {getLayerIcon(layer)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* View Details Button */}
                        <button
                          onClick={() => onEventClick(conversationId, event.SK)}
                          className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat History Panel - Dark Theme */}
        {showChat && (
          <div className="w-[500px] bg-gray-900 flex flex-col">
            <div className="p-6 border-b border-gray-800 bg-gray-950">
              <h3 className="font-semibold text-gray-100">Chat History</h3>
              <p className="text-xs text-gray-400 mt-1">Conversation messages from Chatwoot</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-900 to-gray-950">
              {chatHistory.length > 0 ? (
                <div className="space-y-4">
                  {chatHistory.map((message) => {
                    const messageInfo = getMessageTypeInfo(message);
                    const isImage = message.attachments && message.attachments.length > 0 &&
                                   message.attachments[0].file_type === 'image';

                    // Find matching event for bot messages using pre-built mapping
                    // Check if this is a bot message (outgoing, non-private, from bot sender)
                    const senderType = message.sender?.type?.toLowerCase() || '';
                    const isBotMessage = message.message_type === 1 &&
                      !message.private &&
                      (senderType === 'agent_bot' || senderType === 'bot' || senderType.includes('bot'));
                    const matchingEvent = isBotMessage
                      ? findMatchingEventForMessage(message, messageEventMap)
                      : null;

                    return (
                      <div
                        key={message.id}
                        className="group"
                      >
                        <div className={`rounded-lg p-4 ${messageInfo.bgColor} ${messageInfo.borderColor} border backdrop-blur-sm relative`}>
                          {/* Pencil icon for bot messages with matching event */}
                          {isBotMessage && matchingEvent && (
                            <button
                              onClick={() => onEventClick(conversationId, matchingEvent.SK)}
                              className="absolute top-2 right-2 p-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
                              title="View event details for this response"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Message Header */}
                          <div className={`flex items-center justify-between mb-2 ${isBotMessage && matchingEvent ? 'pr-10' : ''}`}>
                            <div className="flex items-center space-x-2">
                              <div className={`${messageInfo.labelColor}`}>
                                {messageInfo.icon}
                              </div>
                              <span className={`text-xs font-medium ${messageInfo.labelColor}`}>
                                {messageInfo.label}
                              </span>
                              {message.sender?.type && (
                                <span className="text-xs text-gray-500">
                                  ({message.sender.type})
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.created_at * 1000), 'MMM dd, HH:mm:ss')}
                            </span>
                          </div>
                          
                          {/* Message Content with Markdown */}
                          <div className={`${messageInfo.textColor}`}>
                            {isImage ? (
                              <div className="space-y-3">
                                {message.content && (
                                  <div className="prose prose-sm prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {message.content}
                                    </ReactMarkdown>
                                  </div>
                                )}
                                <div className="relative group/image">
                                  <img
                                    src={message.attachments[0].data_url}
                                    alt="Attached image"
                                    className="rounded-lg max-w-full cursor-pointer transition-all hover:brightness-110 hover:shadow-lg"
                                    onClick={() => window.open(message.attachments[0].data_url, '_blank')}
                                  />
                                  <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                    <div className="flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded-md">
                                      <Image className="w-3 h-3" />
                                      <span className="text-xs">Click to view</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="prose prose-sm prose-invert max-w-none">
                                {message.content ? (
                                  <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      // Custom rendering for code blocks
                                      code({node, inline, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                          <div className="relative">
                                            <div className="absolute top-0 right-0 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-bl">
                                              {match[1]}
                                            </div>
                                            <pre className="bg-black/50 rounded-lg p-3 overflow-x-auto">
                                              <code className={className} {...props}>
                                                {children}
                                              </code>
                                            </pre>
                                          </div>
                                        ) : (
                                          <code className="bg-black/30 px-1 py-0.5 rounded text-sm" {...props}>
                                            {children}
                                          </code>
                                        );
                                      },
                                      // Custom rendering for links
                                      a({node, children, ...props}) {
                                        return (
                                          <a 
                                            className="text-blue-400 hover:text-blue-300 underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            {...props}
                                          >
                                            {children}
                                          </a>
                                        );
                                      },
                                      // Custom rendering for lists
                                      ul({node, children, ...props}) {
                                        return (
                                          <ul className="list-disc list-inside space-y-1" {...props}>
                                            {children}
                                          </ul>
                                        );
                                      },
                                      ol({node, children, ...props}) {
                                        return (
                                          <ol className="list-decimal list-inside space-y-1" {...props}>
                                            {children}
                                          </ol>
                                        );
                                      },
                                      // Custom rendering for blockquotes
                                      blockquote({node, children, ...props}) {
                                        return (
                                          <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300" {...props}>
                                            {children}
                                          </blockquote>
                                        );
                                      }
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                ) : (
                                  <em className="opacity-50">No message content</em>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Message Footer - Additional Info */}
                          {(message.private || message.content_attributes?.in_reply_to) && (
                            <div className="mt-3 pt-3 border-t border-gray-700 flex items-center space-x-4">
                              {message.private && (
                                <div className="flex items-center space-x-1 text-amber-400">
                                  <Lock className="w-3 h-3" />
                                  <span className="text-xs">Private Note</span>
                                </div>
                              )}
                              {message.content_attributes?.in_reply_to && (
                                <div className="flex items-center space-x-1 text-gray-400">
                                  <ChevronRight className="w-3 h-3" />
                                  <span className="text-xs">Reply to #{message.content_attributes.in_reply_to}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-400 text-center py-8">
                  <div className="animate-pulse">Loading chat history...</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationTimeline;