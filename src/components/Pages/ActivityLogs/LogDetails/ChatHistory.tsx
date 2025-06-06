import { Bot, Info, MessageSquare, User } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";

type SenderType = "user" | "contact" | "agent_bot";

interface Sender {
  id: number;
  name: string;
  type: SenderType;
  avatar_url?: string;
  available_name?: string;
  availability_status?: string;
  thumbnail?: string;
}

interface Message {
  id: number;
  content: string;
  message_type: 0 | 1 | 2;
  content_type: string;
  status: string;
  created_at: number;
  private: boolean;
  sender?: Sender;
}

interface ChatHistoryProps {
  chatHistory: Message[];
}

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const isIncoming = message.message_type === 0;
  const isInternal = message.message_type === 2;
  const isPrivate = message.private;
  const senderType = message.sender?.type;

  // Handle internal information messages
  if (isInternal) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 my-2">
        <Info className="h-4 w-4" />
        <span>{message.content}</span>
      </div>
    );
  }

  // Handle private messages
  if (isPrivate) {
    return (
      <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 my-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <MessageSquare className="h-4 w-4" />
          <span className="font-medium">Internal Note</span>
        </div>
        <div className="text-sm text-gray-700">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // Handle regular messages
  return (
    <div
      className={`flex gap-3 my-4 ${
        isIncoming ? "justify-start" : "justify-end"
      }`}
    >
      {isIncoming && (
        <div className="flex-shrink-0">
          {senderType === "user" ? (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-gray-600" />
            </div>
          )}
        </div>
      )}

      <div
        className={`w-full flex flex-col ${
          isIncoming ? "items-start" : "items-end"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-700">
            {message.sender?.name || "System"}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message?.created_at * 1000).toLocaleTimeString()}
          </span>
        </div>

        <div
          className={`rounded-lg px-4 py-2 max-w-[80%] ${
            isIncoming
              ? "bg-gray-200 border border-gray-200"
              : "bg-blue-600 text-white"
          }`}
        >
          {message.content_type === "text" ? (
            <div className="text-sm">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-sm">{message.content}</div>
          )}
        </div>
      </div>

      {!isIncoming && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default function ChatHistory({ chatHistory }: ChatHistoryProps) {
  return (
    <div className="border border-orange-500 rounded-lg flex flex-col p-4 space-y-5 max-h-[350px] overflow-y-auto bg-white">
      {chatHistory.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
