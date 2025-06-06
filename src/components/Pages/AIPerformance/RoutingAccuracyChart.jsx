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
import { Users2 } from "lucide-react";

const RoutingAccuracyChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <Users2 className="w-5 h-5 mr-2 text-indigo-500" /> Routing Accuracy
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