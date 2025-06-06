"use client";

import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";
import { formatShortTimeForFlow } from "@/utils";
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  CheckCircle,
  Edit3,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  RefreshCw,
  Search,
  Server,
  SkipForward,
  Target,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ChatHistory from "./ChatHistory";
import LogMainDetails from "./LogMainDetails";

const getStatusIcon = (status) => {
  switch (status) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "failure":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

const getSourceComponentIcon = (sourceComponent) => {
  switch (sourceComponent) {
    case "Orchestrator":
      return <Server className="h-5 w-5 text-slate-500" />;
    case "IntentRecognitionBot":
      return <Brain className="h-5 w-5 text-sky-500" />;
    case "DomainTransferBot":
      return <Zap className="h-5 w-5 text-amber-500" />;
    case "HandoffBot":
      return <Users className="h-5 w-5 text-lime-500" />;
    case "ChatwootSystem":
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    default:
      return <Bot className="h-5 w-5 text-gray-500" />;
  }
};

const getTypeIcon = (type) => {
  if (type === "webhook_received")
    return <LinkIcon className="h-4 w-4 text-cyan-600" />;
  if (type === "intent_recognition")
    return <Brain className="h-4 w-4 text-sky-600" />;
  if (type === "knowledge_retrieval")
    return <Search className="h-4 w-4 text-purple-600" />;
  if (type === "action_execution")
    return <Zap className="h-4 w-4 text-indigo-600" />;
  if (type === "lambda_invocation")
    return <Layers className="h-4 w-4 text-orange-500" />;
  if (type === "chat_message_sent" || type === "chat_form_sent")
    return <ArrowRight className="h-4 w-4 text-indigo-600" />;
  if (type === "handoff_initiated")
    return <Users className="h-4 w-4 text-lime-600" />;
  if (type === "form_presentation_signal")
    return <FileText className="h-4 w-4 text-teal-600" />;
  if (type === "form_submission")
    return <Edit3 className="h-4 w-4 text-teal-700" />;
  if (type === "conversation_resolved")
    return <Archive className="h-4 w-4 text-emerald-600" />;
  return <MessageSquare className="h-4 w-4 text-gray-500" />;
};

const getEventCodeIcon = (eventCode) => {
  switch (eventCode) {
    case "ORCH_CONV_AI_HANDLING_STARTED":
      return <Brain className="h-5 w-5 text-indigo-500" />;
    case "ORCH_INTENT_RECOGNITION_PROCESSED":
      return <Target className="h-5 w-5 text-blue-500" />;
    case "ORCH_SENT_CLARIFICATION_QUESTION":
      return <HelpCircle className="h-5 w-5 text-amber-500" />;
    case "KA_RESPONSE_GENERATED":
      return <BookOpen className="h-5 w-5 text-purple-500" />;
    case "DTA_RESPONSE_GENERATED":
      return <Zap className="h-5 w-5 text-orange-500" />;
    case "DTA_EPP_FORM_REQUESTED":
      return <FileText className="h-5 w-5 text-teal-500" />;
    case "ORCH_FORM_SUBMISSION_EPP_VALIDATION_HANDOFF":
      return <Edit3 className="h-5 w-5 text-emerald-500" />;
    case "ORCH_HANDOFF_INITIATED_BY_IA":
      return <ArrowRight className="h-5 w-5 text-sky-500" />;
    case "ORCH_KNOWLEDGE_AGENT_HANDOFF_INITIATED":
      return <BookOpen className="h-5 w-5 text-violet-500" />;
    case "ORCH_DOMAIN_AGENT_HANDOFF_INITIATED":
      return <Zap className="h-5 w-5 text-amber-500" />;
    case "ORCH_FALLBACK_HANDOFF_INITIATED":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case "CONV_RESOLVED_IN_CHATWOOT":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "CONV_REOPENED_IN_CHATWOOT":
      return <RefreshCw className="h-5 w-5 text-blue-500" />;
    case "ORCH_SKIPPED_PREEXISTING_CONV":
      return <SkipForward className="h-5 w-5 text-gray-500" />;
    default:
      return <Info className="h-5 w-5 text-gray-500" />;
  }
};

export default function LogDetails(props) {
  const { isLoading, isError, logDetails } = props;

  const conversationId = logDetails?.conversationId;
  const conversationFlows = logDetails?.eventTimeline?.events;
  const chatHistory = logDetails?.conversationMessages?.payload;

  console.log({ chatHistory });

  const [selectedFlow, setSelectedFlow] = useState(null);

  const mainContentRef = useRef(null);
  const currentFlowItemRef = useRef(null);
  const conversationFlowPaneRef = useRef(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [selectedFlow?.SK]);

  useEffect(() => {
    if (currentFlowItemRef.current && conversationFlowPaneRef.current) {
      const pane = conversationFlowPaneRef.current;
      const item = currentFlowItemRef.current;

      const paneRect = pane.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      const isItemVisible =
        itemRect.top >= paneRect.top && itemRect.bottom <= paneRect.bottom;

      if (!isItemVisible && item) {
        item.scrollIntoView({
          behavior: "auto",
          block: "nearest",
        });
      }
    }
  }, [selectedFlow?.SK]);

  const handleConversationFlowClick = (flow) => {
    setSelectedFlow(flow);
  };

  useEffect(() => {
    if (conversationFlows && conversationFlows.length > 0) {
      setSelectedFlow(conversationFlows[0]);
    }
  }, [conversationFlows]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[150px]">
        <LoadingSection />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-[150px]">
        <ErrorSection />
      </div>
    );
  }

  return (
    <div
      className="p-3 bg-gray-100 flex flex-col md:flex-row gap-4"
      style={{
        maxHeight: "max(50vh, min-content)",
        overflow: "auto",
      }}
    >
      <div>
        <div className="w-full flex justify-between items-start gap-x-8 p-4 bg-white z-10">
          <div>
            <h5 className="text-md font-semibold text-gray-800 mb-3">
              Conversation Flow
            </h5>
            <div
              ref={conversationFlowPaneRef}
              className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-[280px] md:max-h-[calc(90vh-220px)] overflow-y-auto relative"
            >
              <div className="p-3 border-b border-gray-200 bg-gray-50 sticky top-0 z-[1]">
                <span className="text-xs font-medium text-gray-500">
                  Timeline (Conversation ID: {conversationId})
                </span>
              </div>
              <div className="p-2 space-y-0">
                {conversationFlows.map((flow, index) => (
                  <React.Fragment key={flow?.SK}>
                    <div
                      ref={
                        flow?.SK === selectedFlow?.SK
                          ? currentFlowItemRef
                          : null
                      }
                      onClick={() => handleConversationFlowClick(flow)}
                      className={`flex items-center p-2 rounded-md text-xs cursor-pointer group
                        ${
                          flow?.SK === selectedFlow?.SK
                            ? "bg-blue-100 border border-blue-300 shadow-sm"
                            : "hover:bg-gray-100"
                        }`}
                    >
                      <div className="w-16 text-gray-500 group-hover:text-gray-700 flex-shrink-0 text-right pr-2">
                        {flow?.event_timestamp &&
                          formatShortTimeForFlow(flow?.event_timestamp)}
                      </div>
                      <div
                        className={`w-5 mr-1.5 flex-shrink-0 ${
                          flow?.SK === selectedFlow?.SK
                            ? "text-blue-600"
                            : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      >
                        {getEventCodeIcon(flow?.event_code)}
                      </div>
                      <div
                        className={`flex-1 truncate ${
                          flow?.SK === selectedFlow?.SK
                            ? "font-medium text-blue-800"
                            : "text-gray-700"
                        }`}
                      >
                        {flow?.title}
                      </div>
                      <div className="w-5 ml-1.5 flex-shrink-0">
                        {getStatusIcon(flow?.status)}
                      </div>
                    </div>
                    {index < conversationFlows?.length - 1 && (
                      <div
                        className="flex items-center h-3 my-px"
                        style={{
                          paddingLeft: `calc(64px + 0.375rem + (1.25rem / 2) - (0.125rem / 2) - 2px)`,
                        }}
                      >
                        <div className="w-0.5 h-full bg-gray-300 group-hover:bg-gray-400 transition-colors"></div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="grow">
            <div className="flex items-center border-b border-gray-200 py-2">
              {getEventCodeIcon(selectedFlow?.event_code)}
              <h3 className="font-semibold text-lg text-gray-800 ml-2">
                {selectedFlow?.title}
              </h3>
            </div>
            <div className="py-2">
              <LogMainDetails
                conversationId={conversationId}
                selectedFlow={selectedFlow}
              />
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-white mt-6 pt-4">
          <div className="px-2">
            <h3 className="px-3 py-1.5 font-semibold text-lg text-black ml-2 bg-gray-200 text-center">
              Conversation Details
            </h3>
          </div>
          <div className="mt-4 p-4">
            <ChatHistory chatHistory={chatHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
