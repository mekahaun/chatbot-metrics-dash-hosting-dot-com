import { AlertTriangle, CheckSquare } from "lucide-react";

const TeamRoutingTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow-lg border border-gray-200 text-sm">
        <p className="font-medium text-gray-800 mb-2">{label}</p>
        {payload.map((bar, index) => (
          <div key={index} className="flex items-center justify-between">
            <span
              style={{
                color: bar.fill,
                display: "flex",
                alignItems: "center",
              }}
            >
              {bar.dataKey === "correct" && (
                <CheckSquare className="w-3 h-3 mr-1" />
              )}
              {bar.dataKey === "reassign" && (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              {bar.name}:
            </span>
            <span className="font-semibold ml-2">
              {bar.value.toLocaleString()}
            </span>
          </div>
        ))}
        <p className="text-xs text-gray-600 mt-1 pt-1 border-t">
          Total Routed: {payload[0].payload.total.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default TeamRoutingTooltip; 