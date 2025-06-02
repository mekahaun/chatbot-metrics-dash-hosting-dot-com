"use client";

import { useAppContext } from "../../../components/AppContext";
import AIPerformanceSection from "../sections/AIPerformanceSection";

export default function AIPerformancePage() {
  const { timePeriod } = useAppContext();

  return (
    <AIPerformanceSection
      selectedTimePeriod={timePeriod}
      setActiveSection={() => {}}
    />
  );
}
