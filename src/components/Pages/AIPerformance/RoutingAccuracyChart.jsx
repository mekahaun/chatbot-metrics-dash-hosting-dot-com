import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import TeamRoutingTooltip from "./TeamRoutingTooltip";
import { ShieldQuestionIcon, Users2 } from "lucide-react";
import TooltipComponent from "@/components/Shared/Common/Tooltip";

const RoutingAccuracyChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <Users2 className="w-5 h-5 mr-2 text-indigo-500" /> Routing Accuracy
        <a className="routing-accuracy-tooltip cursor-pointer ml-3" href="#">
          <ShieldQuestionIcon className="w-5 h-5 mr-2 text-blue-500" />
        </a>
        <TooltipComponent
          anchorSelect=".routing-accuracy-tooltip"
          text={
            <div className="max-w-md">
              This shows how accurately AI routes conversations to the correct teams.
              <br />
              <br />
              Correctly Routed: Conversations properly assigned to the right team (shown in green)
              <br />
              <br />
              Reassigned/Incorrect: Conversations that needed to be moved to a different team (shown in yellow)
              <br />
              <br />
              Teams shown: Technical Support, Sales Team, Billing Team, General
            </div>
          }
        />
      </h3>
      <div
        style={{
          height: `${Math.max(200, data.length * 80)}px`,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 20 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
            />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="team"
              width={150}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<TeamRoutingTooltip />}
              cursor={{ fill: "rgba(230, 230, 230, 0.5)" }}
            />
            <Legend
              iconSize={10}
              wrapperStyle={{ fontSize: 12, paddingTop: "10px" }}
              verticalAlign="top"
              align="right"
            />
            <Bar
              dataKey="correct"
              name="Correctly Routed"
              fill="#22c55e"
              barSize={20}
              isAnimationActive={false}
            />
            <Bar
              dataKey="reassign"
              name="Reassigned/Incorrect"
              fill="#facc15"
              barSize={20}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RoutingAccuracyChart; 