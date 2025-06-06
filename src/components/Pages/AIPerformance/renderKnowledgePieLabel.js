const renderKnowledgePieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const numericPercentage = percent * 100;
  if (numericPercentage < 5) return null; // Don't render label if too small

  const displayPercentage = numericPercentage.toFixed(0);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name} (${displayPercentage}%)`}
    </text>
  );
};

export default renderKnowledgePieLabel;
