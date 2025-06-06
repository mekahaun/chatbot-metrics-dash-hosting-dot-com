import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  FileText,
  Gauge,
  Hash,
  Info,
  Link as LinkIcon,
  MessageSquare,
  Target,
  Timer,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import DetailItem from "./DetailItem";

const formatDuration = (milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${
      remainingMinutes > 0
        ? `and ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`
        : ""
    }`;
  }
  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
};

const JsonSyntaxHighlighted = ({ data, maxHeight = "16rem" }) => {
  if (!data) return null;
  return (
    <SyntaxHighlighter
      language="json"
      style={okaidia}
      wrapLines={true}
      lineProps={{
        style: { wordBreak: "break-all", whiteSpace: "pre-wrap" },
      }}
      customStyle={{
        borderRadius: "0.375rem",
        padding: "1rem",
        margin: "0",
        fontSize: "0.8em",
        maxHeight: maxHeight,
        overflowY: "auto",
      }}
      className="text-xs"
    >
      {JSON.stringify(data, null, 2)}
    </SyntaxHighlighter>
  );
};

export default function LogMainDetails({
  conversationId,
  selectedFlow,
}) {
  const [expandedRawDataFor, setExpandedRawDataFor] = useState(false);

  const renderSpecificDetails = (details) => {
    switch (details?.event_code) {
      case "ORCH_CONV_AI_HANDLING_STARTED":
        return (
          <>
            <DetailItem
              label="Account ID"
              value={details?.details?.accountId}
              icon={<Hash />}
              code
            />
            <DetailItem
              label="Inbox Name"
              value={details?.details?.inboxName}
              icon={<MessageSquare />}
            />
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "ORCH_INTENT_RECOGNITION_PROCESSED":
        return (
          <>
            <DetailItem
              label="Intent Type"
              value={details?.details?.ia_type}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Intent Confidence"
              value={details?.details?.ia_confidence?.toFixed(2)}
              icon={<Gauge />}
            />
            {details?.details?.ia_clarification_question_asked && (
              <DetailItem
                label="Clarification Question Asked"
                value={details?.details?.ia_clarification_question_asked}
                icon={<MessageSquare />}
                markdown
                fullWidth
              />
            )}
            {details?.details?.ia_handoff_main_category && (
              <DetailItem
                label="Handoff Main Category"
                value={details?.details?.ia_handoff_main_category}
                icon={<Users />}
                code
              />
            )}
            {details?.details?.ia_handoff_reason_category && (
              <DetailItem
                label="Handoff Reason Category"
                value={details?.details?.ia_handoff_reason_category}
                icon={<Info />}
                code
              />
            )}
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "ORCH_SENT_CLARIFICATION_QUESTION":
        return (
          <>
            <DetailItem
              label="Partial Intent"
              value={details?.details?.ia_partial_intent}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Clarification Question"
              value={details?.details?.clarification_question}
              icon={<MessageSquare />}
              markdown
              fullWidth
            />
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "ORCH_HANDOFF_INITIATED_BY_IA":
        return (
          <>
            <DetailItem
              label="Handoff Reason"
              value={details?.details?.handoff_reason_from_ia}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Confidence Score"
              value={`${(details?.details?.ia_confidence_score * 100).toFixed(
                2
              )}%`}
              icon={<Gauge />}
            />
            <DetailItem
              label="Master Category"
              value={details?.details?.ia_master_category_at_handoff}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Sub Category"
              value={details?.details?.ia_sub_category_at_handoff}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Target Team"
              value={details?.details?.target_team_category}
              icon={<Users />}
              code
            />
            {details?.details?.ia_internal_note_for_handoff && (
              <DetailItem
                label="Internal Note"
                value={details?.details?.ia_internal_note_for_handoff}
                icon={<Info />}
                markdown
                fullWidth
              />
            )}
            {details?.details?.ia_optimization_opportunities?.length > 0 && (
              <DetailItem
                label="Optimization Opportunities"
                fullWidth
                icon={<Info />}
              >
                <div className="mt-1 space-y-2">
                  {details?.details?.ia_optimization_opportunities.map(
                    (opp, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-2.5 rounded-md border text-xs"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-semibold text-indigo-700">
                            {opp.impact_level}
                          </h5>
                        </div>
                        <p className="text-gray-600">{opp.suggestion}</p>
                      </div>
                    )
                  )}
                </div>
              </DetailItem>
            )}
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "ORCH_DOMAIN_AGENT_HANDOFF_INITIATED":
        return (
          <>
            <DetailItem
              label="Handoff Reason"
              value={details?.details?.handoff_reason_from_ia}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Confidence Score"
              value={`${(details?.details?.ia_confidence_score * 100).toFixed(
                2
              )}%`}
              icon={<Gauge />}
            />
            <DetailItem
              label="Master Category"
              value={details?.details?.ia_master_category_at_handoff}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Sub Category"
              value={details?.details?.ia_sub_category_at_handoff}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Target Team"
              value={details?.details?.target_team_category}
              icon={<Users />}
              code
            />
            {details?.details?.ia_internal_note_for_handoff && (
              <DetailItem
                label="Internal Note"
                value={details?.details?.ia_internal_note_for_handoff}
                icon={<Info />}
                markdown
                fullWidth
              />
            )}
            {details?.details?.ia_optimization_opportunities?.length > 0 && (
              <DetailItem
                label="Optimization Opportunities"
                fullWidth
                icon={<Info />}
              >
                <div className="mt-1 space-y-2">
                  {details?.details?.ia_optimization_opportunities.map(
                    (opp, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-2.5 rounded-md border text-xs"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-semibold text-indigo-700">
                            {opp.impact_level}
                          </h5>
                        </div>
                        <p className="text-gray-600">{opp.suggestion}</p>
                      </div>
                    )
                  )}
                </div>
              </DetailItem>
            )}
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "ORCH_FALLBACK_HANDOFF_INITIATED":
        return (
          <>
            {/* Scenario 1: Disabled Agent */}
            {details?.details?.disabled_agent && (
              <>
                <DetailItem
                  label="Disabled Agent"
                  value={details?.details?.disabled_agent}
                  icon={<AlertTriangle />}
                  code
                />
                <DetailItem
                  label="Original Intent Type"
                  value={details?.details?.original_intent_type}
                  icon={<Target />}
                  code
                />
                <DetailItem
                  label="Fallback Reason"
                  value={details?.details?.fallback_reason}
                  icon={<Info />}
                  markdown
                  fullWidth
                />
              </>
            )}

            {/* Scenario 2: Unrecognized Intent */}
            {details?.details?.unrecognized_intent_type && (
              <>
                <DetailItem
                  label="Unrecognized Intent Type"
                  value={details?.details?.unrecognized_intent_type}
                  icon={<Target />}
                  code
                />
                <DetailItem
                  label="User Query"
                  value={details?.details?.fallback_args_used?.user_query}
                  icon={<MessageSquare />}
                  code
                  fullWidth
                />
                <DetailItem
                  label="Master Category"
                  value={details?.details?.fallback_args_used?.master_category}
                  icon={<Target />}
                  code
                />
                <DetailItem
                  label="Sub Category"
                  value={details?.details?.fallback_args_used?.sub_category}
                  icon={<Target />}
                  code
                />
                <DetailItem
                  label="Priority"
                  value={details?.details?.fallback_args_used?.priority}
                  icon={<AlertTriangle />}
                  code
                />
                {details?.details?.fallback_args_used?.confidence && (
                  <DetailItem
                    label="Confidence"
                    value={`${(
                      details?.details?.fallback_args_used?.confidence * 100
                    ).toFixed(2)}%`}
                    icon={<Gauge />}
                  />
                )}
                <DetailItem
                  label="Reason"
                  value={details?.details?.fallback_args_used?.reason}
                  icon={<Info />}
                  markdown
                  fullWidth
                />
                <DetailItem
                  label="First Message"
                  value={details?.details?.fallback_args_used?.firstMessage}
                  icon={<MessageSquare />}
                  markdown
                  fullWidth
                />
                <DetailItem
                  label="Second Message"
                  value={details?.details?.fallback_args_used?.secondMessage}
                  icon={<MessageSquare />}
                  markdown
                  fullWidth
                />
                {details?.details?.fallback_args_used?.internal_note && (
                  <DetailItem
                    label="Internal Note"
                    value={details?.details?.fallback_args_used?.internal_note}
                    icon={<Info />}
                    markdown
                    fullWidth
                  />
                )}
                {details?.details?.fallback_args_used
                  ?.optimization_opportunities?.length > 0 && (
                  <DetailItem
                    label="Optimization Opportunities"
                    fullWidth
                    icon={<Info />}
                  >
                    <div className="mt-1 space-y-2">
                      {details?.details?.fallback_args_used?.optimization_opportunities.map(
                        (opp, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-2.5 rounded-md border text-xs"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="font-semibold text-indigo-700">
                                {opp.impact_level}
                              </h5>
                            </div>
                            <p className="text-gray-600">{opp.suggestion}</p>
                          </div>
                        )
                      )}
                    </div>
                  </DetailItem>
                )}
              </>
            )}

            {/* Common fields for both scenarios */}
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "ORCH_KNOWLEDGE_AGENT_HANDOFF_INITIATED":
        return (
          <>
            <DetailItem
              label="Master Category"
              value={details?.details?.agent_result?.master_category}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Sub Category"
              value={details?.details?.agent_result?.sub_category}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Status"
              value={details?.details?.agent_result?.status}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Context Quality"
              value={`${details?.details?.agent_result?.context_quality}/10`}
              icon={<Gauge />}
            />
            <DetailItem
              label="Context Relevance"
              value={details?.details?.agent_result?.context_relevance}
              icon={<Gauge />}
            />
            <DetailItem
              label="Retrieval Effectiveness"
              value={
                details?.details?.agent_result?.retrieval_effectiveness_gemini
              }
              icon={<Info />}
              code
            />
            <DetailItem
              label="Handoff Reason"
              value={details?.details?.agent_result?.reason}
              icon={<Info />}
              markdown
              fullWidth
            />
            <DetailItem
              label="Handoff Reason Category"
              value={
                details?.details?.agent_result?.handoff_reason_category_gemini
              }
              icon={<Info />}
              code
            />
            <DetailItem
              label="First Message"
              value={details?.details?.agent_result?.first_message}
              icon={<MessageSquare />}
              markdown
              fullWidth
            />
            <DetailItem
              label="Second Message"
              value={details?.details?.agent_result?.second_message}
              icon={<MessageSquare />}
              markdown
              fullWidth
            />
            {details?.details?.agent_result?.internal_note && (
              <DetailItem
                label="Internal Note"
                value={details?.details?.agent_result?.internal_note}
                icon={<Info />}
                markdown
                fullWidth
              />
            )}
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "ORCH_FORM_SUBMISSION_EPP_VALIDATION_HANDOFF":
        return (
          <>
            <DetailItem
              label="Form Handler Status"
              value={details?.details?.form_handler_status}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Form Handler Result Type"
              value={details?.details?.form_handler_result_type}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Master Category"
              value={
                details?.details?.dta_result_from_form_flow?.master_category
              }
              icon={<Target />}
              code
            />
            <DetailItem
              label="Sub Category"
              value={details?.details?.dta_result_from_form_flow?.sub_category}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Status"
              value={details?.details?.dta_result_from_form_flow?.status}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Reason"
              value={details?.details?.dta_result_from_form_flow?.reason}
              icon={<Info />}
              markdown
            />
            <DetailItem
              label="First Message"
              value={details?.details?.dta_result_from_form_flow?.first_message}
              icon={<MessageSquare />}
              markdown
              fullWidth
            />
            <DetailItem
              label="Second Message"
              value={
                details?.details?.dta_result_from_form_flow?.second_message
              }
              icon={<MessageSquare />}
              markdown
              fullWidth
            />
            {details?.details?.dta_result_from_form_flow?.details_for_log
              ?.epp_code_received_length && (
              <DetailItem
                label="EPP Code Length"
                value={
                  details?.details?.dta_result_from_form_flow?.details_for_log
                    ?.epp_code_received_length
                }
                icon={<Hash />}
              />
            )}
            {details?.details?.dta_result_from_form_flow?.internal_note && (
              <DetailItem
                label="Internal Note"
                value={
                  details?.details?.dta_result_from_form_flow?.internal_note
                }
                icon={<Info />}
                markdown
                fullWidth
              />
            )}
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "DTA_RESPONSE_GENERATED":
        return (
          <>
            <DetailItem
              label="Action"
              value={details?.details?.agent_result?.action}
              icon={<Zap />}
              code
            />
            <DetailItem
              label="Master Category"
              value={details?.details?.agent_result?.master_category}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Sub Category"
              value={details?.details?.agent_result?.sub_category}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Context Quality"
              value={`${details?.details?.agent_result?.context_quality}/10`}
              icon={<Gauge />}
            />
            <DetailItem
              label="Context Relevance"
              value={details?.details?.agent_result?.context_relevance}
              icon={<Gauge />}
            />
            <DetailItem
              label="Status"
              value={details?.details?.agent_result?.status}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Retrieval Effectiveness"
              value={
                details?.details?.agent_result?.retrieval_effectiveness_gemini
              }
              icon={<Info />}
              code
            />
            <DetailItem
              label="Response"
              value={details?.details?.agent_result?.response}
              icon={<MessageSquare />}
              markdown
              fullWidth
            />
            {details?.details?.agent_result?.call_to_action_text_from_dta && (
              <DetailItem
                label="Call to Action"
                value={
                  details?.details?.agent_result?.call_to_action_text_from_dta
                }
                icon={<MessageSquare />}
                markdown
                fullWidth
              />
            )}
            {details?.details?.agent_result?.internal_note && (
              <DetailItem
                label="Internal Note"
                value={details?.details?.agent_result?.internal_note}
                icon={<Info />}
                markdown
                fullWidth
              />
            )}
            {details?.details?.agent_result?.optimization_opportunities
              ?.length > 0 && (
              <DetailItem
                label="Optimization Opportunities"
                fullWidth
                icon={<Info />}
              >
                <div className="mt-1 space-y-2">
                  {details?.details?.agent_result?.optimization_opportunities.map(
                    (opp, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-2.5 rounded-md border text-xs"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-semibold text-indigo-700">
                            {opp.impact_level}
                          </h5>
                        </div>
                        <p className="text-gray-600">{opp.suggestion}</p>
                      </div>
                    )
                  )}
                </div>
              </DetailItem>
            )}
            {details?.details?.agent_result?.knowledge_sources_formatted
              ?.length > 0 && (
              <DetailItem
                label="Knowledge Sources"
                fullWidth
                icon={<BookOpen />}
              >
                <div className="mt-1 space-y-2">
                  {details?.details?.agent_result?.knowledge_sources_formatted.map(
                    (source, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-2.5 rounded-md border text-xs"
                      >
                        <div className="flex justify-between items-start mb-1 gap-x-2">
                          <h5 className="font-semibold text-indigo-700">
                            {source.title}
                          </h5>
                          {source.score && (
                            <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                              Score: {source.score.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <a
                          href={source.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <LinkIcon className="h-3 w-3 mr-1" />
                          {source.link}
                        </a>
                        {source.matched_section_preview && (
                          <p className="text-gray-500 mt-0.5">
                            Preview: <em>{source.matched_section_preview}</em>
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </DetailItem>
            )}
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "DTA_EPP_FORM_REQUESTED":
        return (
          <>
            <DetailItem
              label="Domain Name"
              value={details?.details?.agent_result?.domain_name}
              icon={<LinkIcon />}
              code
            />
            <DetailItem
              label="Action"
              value={details?.details?.agent_result?.action}
              icon={<Zap />}
              code
            />
            <DetailItem
              label="Master Category"
              value={details?.details?.agent_result?.master_category}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Sub Category"
              value={details?.details?.agent_result?.sub_category}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Status"
              value={details?.details?.agent_result?.status}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Response"
              value={details?.details?.agent_result?.response}
              icon={<MessageSquare />}
              markdown
              fullWidth
            />
            {details?.details?.agent_result?.form_data && (
              <DetailItem label="Form Details" fullWidth icon={<FileText />}>
                <div className="mt-1 space-y-2">
                  <div className="bg-gray-50 p-2.5 rounded-md border text-xs">
                    <div className="flex justify-between items-start mb-1 gap-x-2">
                      <h5 className="font-semibold text-indigo-700">
                        {details?.details?.agent_result?.form_data?.label}
                      </h5>
                    </div>
                    <p className="text-gray-600">
                      Field Name:{" "}
                      {details?.details?.agent_result?.form_data?.field_name}
                    </p>
                    <p className="text-gray-500 mt-0.5">
                      Placeholder:{" "}
                      <em>
                        {details?.details?.agent_result?.form_data?.placeholder}
                      </em>
                    </p>
                  </div>
                </div>
              </DetailItem>
            )}
            {details?.details?.agent_result?.internal_note && (
              <DetailItem
                label="Internal Note"
                value={details?.details?.agent_result?.internal_note}
                icon={<Info />}
                markdown
                fullWidth
              />
            )}
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "KA_RESPONSE_GENERATED":
        return (
          <>
            <DetailItem
              label="Action"
              value={details?.details?.agent_result?.action}
              icon={<Zap />}
              code
            />
            <DetailItem
              label="Master Category"
              value={details?.details?.agent_result?.master_category}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Sub Category"
              value={details?.details?.agent_result?.sub_category}
              icon={<Target />}
              code
            />
            <DetailItem
              label="Context Quality"
              value={`${details?.details?.agent_result?.context_quality}/10`}
              icon={<Gauge />}
            />
            <DetailItem
              label="Context Relevance"
              value={details?.details?.agent_result?.context_relevance}
              icon={<Gauge />}
            />
            <DetailItem
              label="Status"
              value={details?.details?.agent_result?.status}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Retrieval Effectiveness"
              value={
                details?.details?.agent_result?.retrieval_effectiveness_gemini
              }
              icon={<Info />}
              code
            />
            <DetailItem
              label="Response"
              value={details?.details?.agent_result?.response}
              icon={<MessageSquare />}
              markdown
              fullWidth
            />
            {details?.details?.agent_result?.internal_note && (
              <DetailItem
                label="Internal Note"
                value={details?.details?.agent_result?.internal_note}
                icon={<Info />}
                markdown
                fullWidth
              />
            )}
            {details?.details?.agent_result?.optimization_opportunities
              ?.length > 0 && (
              <DetailItem
                label="Optimization Opportunities"
                fullWidth
                icon={<Info />}
              >
                <div className="mt-1 space-y-2">
                  {details?.details?.agent_result?.optimization_opportunities.map(
                    (opp, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-2.5 rounded-md border text-xs"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-semibold text-indigo-700">
                            {opp.impact_level}
                          </h5>
                        </div>
                        <p className="text-gray-600">{opp.suggestion}</p>
                      </div>
                    )
                  )}
                </div>
              </DetailItem>
            )}
            {details?.details?.agent_result?.knowledge_sources_formatted
              ?.length > 0 && (
              <DetailItem
                label="Knowledge Sources"
                fullWidth
                icon={<BookOpen />}
              >
                <div className="mt-1 space-y-2">
                  {details?.details?.agent_result?.knowledge_sources_formatted.map(
                    (source, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-2.5 rounded-md border text-xs"
                      >
                        <div className="flex justify-between items-start mb-1 gap-x-2">
                          <h5 className="font-semibold text-indigo-700">
                            {source.title}
                          </h5>
                          {source.score && (
                            <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                              Score: {source.score.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <a
                          href={source.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <LinkIcon className="h-3 w-3 mr-1" />
                          {source.link}
                        </a>
                        {source.matched_section_preview && (
                          <p className="text-gray-500 mt-0.5">
                            Preview: <em>{source.matched_section_preview}</em>
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </DetailItem>
            )}
            <DetailItem
              label="Event Timestamp"
              value={new Date(details?.event_timestamp).toLocaleString()}
              icon={<Timer />}
            />
          </>
        );
      case "CONV_RESOLVED_IN_CHATWOOT":
        return (
          <>
            <DetailItem
              label="Resolved By"
              value={details?.details?.resolved_by_name}
              icon={<User />}
            />
            <DetailItem
              label="Resolved By Type"
              value={details?.details?.resolved_by_type}
              icon={<User />}
              code
            />
            <DetailItem
              label="Resolution Method"
              value={details?.details?.resolution_method_determined}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Resolution Count"
              value={details?.details?.resolution_count}
              icon={<Hash />}
            />
            <DetailItem
              label="Is Repeat Resolution"
              value={details?.details?.is_repeat_resolution ? "Yes" : "No"}
              icon={<Info />}
            />
            <DetailItem
              label="Webhook Event Type"
              value={details?.details?.webhook_event_type_processed}
              icon={<LinkIcon />}
              code
            />
            {details?.details?.conversation_duration_ms && (
              <DetailItem
                label="Conversation Duration"
                value={formatDuration(
                  details?.details?.conversation_duration_ms || 0
                )}
                icon={<Timer />}
              />
            )}
            {details?.details?.resolution_reason_ai_generated && (
              <DetailItem
                label="AI Generated Resolution Reason"
                value={details?.details?.resolution_reason_ai_generated}
                icon={<Info />}
                markdown
                fullWidth
              />
            )}
            {details?.details?.resolution_reason_chatwoot && (
              <DetailItem
                label="Chatwoot Resolution Reason"
                value={details?.details?.resolution_reason_chatwoot}
                icon={<Info />}
                markdown
                fullWidth
              />
            )}
            {details?.details?.previous_resolved_at_cw && (
              <DetailItem
                label="Previously Resolved At"
                value={new Date(
                  details?.details?.previous_resolved_at_cw
                ).toLocaleString()}
                icon={<Timer />}
              />
            )}
          </>
        );
      case "CONV_REOPENED_IN_CHATWOOT":
        return (
          <>
            <DetailItem
              label="Reopened By"
              value={details?.details?.reopened_by_name}
              icon={<User />}
            />
            <DetailItem
              label="Reopened By Type"
              value={details?.details?.reopened_by_type}
              icon={<User />}
              code
            />
            <DetailItem
              label="Previous Resolution Method"
              value={details?.details?.previous_resolution_method}
              icon={<Info />}
              code
            />
            <DetailItem
              label="Resolution Count Before Reopen"
              value={details?.details?.resolution_count_before_reopen}
              icon={<Hash />}
            />
            <DetailItem
              label="Webhook Event Type"
              value={details?.details?.webhook_event_type_processed}
              icon={<LinkIcon />}
              code
            />
            {details?.details?.previous_resolved_at && (
              <DetailItem
                label="Previously Resolved At"
                value={new Date(
                  details?.details?.previous_resolved_at
                ).toLocaleString()}
                icon={<Timer />}
              />
            )}
          </>
        );
      default:
        return (
          <p className="text-sm text-gray-500">
            No specific detail view for this component type.
          </p>
        );
    }
  };

  return (
    // max-h-[350px]
    <div className="mt-2 max-h-[350px] overflow-y-auto border border-gray-200 rounded-lg p-4">
      <div>{renderSpecificDetails(selectedFlow)}</div>
      <div>
        {(selectedFlow?.internal_note_generated ||
          selectedFlow?.geminiFunctionCall?.args?.internal_note) && (
          <DetailItem
            label="Internal Note"
            value={
              selectedFlow?.internal_note_generated ||
              selectedFlow?.geminiFunctionCall?.args?.internal_note
            }
            icon={<Info />}
            markdown
            fullWidth
          />
        )}

        {(selectedFlow?.eventImpact ||
          selectedFlow?.improvementOpportunity) && (
          <div>
            <h5 className="text-md font-semibold text-gray-800 mb-2">
              Analysis
            </h5>
            <div className="bg-gray-50 p-4 rounded-lg border shadow-sm">
              {selectedFlow?.eventImpact && (
                <div
                  className={`${
                    selectedFlow?.improvementOpportunity ? "mb-4" : ""
                  }`}
                >
                  <h6 className="text-sm font-semibold text-gray-700 mb-1">
                    Event Impact
                  </h6>
                  <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                    <ReactMarkdown>{selectedFlow?.eventImpact}</ReactMarkdown>
                  </div>
                </div>
              )}
              {selectedFlow?.improvementOpportunity && (
                <div>
                  <h6 className="text-sm font-semibold text-gray-700 mb-1">
                    Improvement Opportunities
                  </h6>
                  <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                    <ReactMarkdown>
                      {selectedFlow?.improvementOpportunity}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-2">
          <details
            className="group"
            open={expandedRawDataFor}
            onToggle={(e) => {
              if (e.currentTarget.open) {
                setExpandedRawDataFor(true);
              } else if (expandedRawDataFor) {
                setExpandedRawDataFor(false);
              }
            }}
          >
            <summary className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer list-none flex items-center py-2">
              <ChevronRight className="h-4 w-4 mr-1 transform transition-transform duration-150 ease-in-out group-open:rotate-90" />
              Raw Event Data
            </summary>
            {expandedRawDataFor && (
              <div className="mt-1">
                <JsonSyntaxHighlighted data={selectedFlow} />
              </div>
            )}
          </details>
        </div>

        <div className="py-4 flex justify-start">
          <a
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center shadow-sm block"
            target="_blank"
            href={`${process.env.NEXT_PUBLIC_CHATWOOT_URL_WITH_ACC_ID}/conversations/${conversationId}`}
          >
            <MessageSquare className="h-4 w-4 mr-2" /> View Full Conversation
          </a>
        </div>
      </div>
    </div>
  );
}
