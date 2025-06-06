const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow-lg border border-gray-200 text-sm">
        <p className="font-medium text-gray-800 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}${
              entry.dataKey === "intentAccuracy" ||
              entry.dataKey === "handoffAccuracy"
                ? "%"
                : ""
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip; 