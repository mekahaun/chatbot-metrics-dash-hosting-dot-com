import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import renderResolutionPieLabel from "./renderResolutionPieLabel";
import CustomTooltip from "./CustomTooltip";
import { CheckCircle, ShieldQuestionIcon } from "lucide-react";
import TooltipComponent from "@/components/Shared/Common/Tooltip";

const ConversationResolutionChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Conversation
        Resolution Types
        <a className="conversation-resolution-types-tooltip cursor-pointer ml-3" href="#">
          <ShieldQuestionIcon className="w-5 h-5 mr-2 text-blue-500" />
        </a>
        <TooltipComponent
          anchorSelect=".conversation-resolution-types-tooltip"
          text={
            <div className="max-w-md">
              This shows how conversations are being resolved in your system.
              <br />
              <br />
              Resolved by AI: Conversations completed entirely by AI without human help
              <br />
              <br />
              Resolved by Human (Post-Handoff): Conversations where AI handed off to humans who then resolved the issue
              <br />
              <br />
              Open/Unresolved: Active conversations still in progress or pending
            </div>
          }
        />
      </h3>
      <div style={{ height: "350px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderResolutionPieLabel}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConversationResolutionChart; 