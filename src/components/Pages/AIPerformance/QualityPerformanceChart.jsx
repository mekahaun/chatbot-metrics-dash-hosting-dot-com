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
import { ShieldQuestionIcon, TrendingUp } from "lucide-react";
import TooltipComponent from "@/components/Shared/Common/Tooltip";

const QualityPerformanceChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-purple-500" /> Quality &
        Performance Over Time
        <a className="quality-performance-over-time-tooltip cursor-pointer ml-3" href="#">
          <ShieldQuestionIcon className="w-5 h-5 mr-2 text-blue-500" />
        </a>
        <TooltipComponent
          anchorSelect=".quality-performance-over-time-tooltip"
          text={
            <div className="max-w-md">
              This chart tracks the quality of AI responses and success rate of automated actions over time.
              <br />
              <br />
              Context Quality (RAG): Average quality of information retrieved by AI to answer questions (0-10 scale)
              <br />
              <br />
              Action Success Rate: Percentage of AI-initiated actions that were completed successfully (0-100%)
            </div>
          }
        />
      </h3>
      <div style={{ height: "450px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              domain={[5.5, 7.5]}
              label={{
                value: "Context Quality (0-10)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              domain={[70, 80]}
              label={{
                value: "Action Success Rate (%)",
                angle: 90,
                position: "insideRight",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="contextQuality"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Context Quality (RAG)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="actionSuccessRate"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Action Success Rate (%)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default QualityPerformanceChart; 