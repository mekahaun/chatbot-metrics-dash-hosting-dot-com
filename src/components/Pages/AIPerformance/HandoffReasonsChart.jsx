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
import { AlertTriangle } from "lucide-react";

const HandoffReasonsChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" /> Top Handoff
        Reasons
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