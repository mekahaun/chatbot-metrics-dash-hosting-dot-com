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
import { Brain, ShieldQuestionIcon } from "lucide-react";
import TooltipComponent from "@/components/Shared/Common/Tooltip";

const KnowledgeRetrievalChart = ({ data }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2 text-purple-500" /> Knowledge Retrieval
        Effectiveness
        <a className="knowledge-retrieval-effectiveness-tooltip cursor-pointer ml-3" href="#">
          <ShieldQuestionIcon className="w-5 h-5 mr-2 text-blue-500" />
        </a>
        <TooltipComponent
          anchorSelect=".knowledge-retrieval-effectiveness-tooltip"
          text={
            <div className="max-w-md">
              This shows how effectively your AI retrieves relevant information from its knowledge base.
              <br />
              <br />
              Successful Retrieval: AI found highly relevant information that directly helped answer the question
              <br />
              <br />
              Low Relevance: AI found some information but it wasn't very helpful for the specific question
              <br />
              <br />
              No Match Found: AI couldn't find any relevant information in its knowledge base
              <br />
              <br />
              Not Applicable: Events where knowledge retrieval assessment wasn't relevant or available
            </div>
          }
        />
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