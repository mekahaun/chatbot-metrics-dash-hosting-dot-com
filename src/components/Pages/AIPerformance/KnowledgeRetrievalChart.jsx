import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import renderKnowledgePieLabel from "./renderKnowledgePieLabel";
import CustomTooltip from "./CustomTooltip";
import { Brain } from "lucide-react";

const KnowledgeRetrievalChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2 text-purple-500" /> Knowledge Retrieval
        Effectiveness
      </h3>
      <div style={{ height: "350px" }} className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderKnowledgePieLabel}
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

export default KnowledgeRetrievalChart; 