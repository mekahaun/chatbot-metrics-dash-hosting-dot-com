import {
  Target
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomTooltip from "./CustomTooltip";

const AccuracyMetricsChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <Target className="w-5 h-5 mr-2 text-blue-500" /> Accuracy Metrics Over
        Time
      </h3>
      <div style={{ height: "450px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[80, 95]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
            <Line
              type="monotone"
              dataKey="intentAccuracy"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Intent Accuracy (%)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="handoffAccuracy"
              stroke="#10b981"
              strokeWidth={2}
              name="Handoff Accuracy (%)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AccuracyMetricsChart; 