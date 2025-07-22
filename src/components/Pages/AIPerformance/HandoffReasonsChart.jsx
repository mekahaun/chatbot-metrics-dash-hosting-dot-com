import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import { AlertTriangle, ShieldQuestionIcon } from "lucide-react";
import TooltipComponent from "@/components/Shared/Common/Tooltip";

const HandoffReasonsChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" /> Top Handoff
        Reasons
        <a className="top-handoff-reasons-tooltip cursor-pointer ml-3" href="#">
          <ShieldQuestionIcon className="w-5 h-5 mr-2 text-blue-500" />
        </a>
        <TooltipComponent
          anchorSelect=".top-handoff-reasons-tooltip"
          text={
            <div className="max-w-md">
              This shows the main reasons why AI hands off conversations to human agents.
              <br />
              <br />
              Ka Initiated Handoff: AI's knowledge system determined it couldn't provide adequate answers
              <br />
              <br />
              Human Action Needed: Tasks requiring human judgment, manual processing, or decision-making
              <br />
              <br />
              System Error Or Bug: Technical problems that prevented AI from functioning properly
              <br />
              <br />
            </div>
          }
        />
      </h3>
      <div style={{ height: "350px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 120, right: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="reason"
              tick={{ fontSize: 12 }}
              width={110}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(230, 230, 230, 0.5)" }}
            />
            <Bar
              dataKey="count"
              name="Handoff Count"
              barSize={20}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HandoffReasonsChart; 