"use client";

import { useAppContext } from "@/components/context/AppContext";

const timePeriods = [
  { id: "L1H", name: "Last Hour" },
  { id: "L24H", name: "Last 24 Hours" },
  { id: "L7D", name: "Last 7 Days" },
  { id: "L30D", name: "Last 30 Days" },
  { id: "TODAY", name: "Today" },
  { id: "YESTERDAY", name: "Yesterday" },
  { id: "CMONTH", name: "Current Month" },
];

const TopMenu = ({ sectionName }) => {
  const { timePeriod, setTimePeriod } = useAppContext();

  const selectedPeriodObject = timePeriods.find((p) => p.id === timePeriod);
  const selectedPeriodName = selectedPeriodObject
    ? selectedPeriodObject.name
    : timePeriod;

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  return (
    <div className="h-20 bg-white border-b border-gray-300 flex items-center justify-between px-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          {sectionName || "Dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Displaying data for: {selectedPeriodName}
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">Time Period:</span>
        <select
          value={timePeriod}
          onChange={handleTimePeriodChange}
          className="block w-auto pl-3 pr-10 py-2 text-sm bg-white border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
        >
          {timePeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TopMenu;
