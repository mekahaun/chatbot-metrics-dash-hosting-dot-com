import { CheckCircle, Users, XCircle } from "lucide-react";

const CategoryTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
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
              {bar.dataKey === "aiResolvedPercent" && (
                <CheckCircle className="w-3 h-3 mr-1" />
              )}
              {bar.dataKey === "humanAssistedPercent" && (
                <Users className="w-3 h-3 mr-1" />
              )}
              {bar.dataKey === "notResolvedPercent" && (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {bar.name}:
            </span>
            <span className="font-semibold ml-2">
              {bar.payload[bar.dataKey.replace("Percent", "")].toLocaleString()}{" "}
              ({bar.value.toFixed(1)}%)
            </span>
          </div>
        ))}
        <p className="text-xs text-gray-600 mt-1 pt-1 border-t">
          Total: {data.total.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default CategoryTooltip; 