"use client";

import { useAppContext } from "../../../components/AppContext";
import SystemControlSection from "../sections/SystemControlSection";

export default function SystemControlPage() {
  const { timePeriod } = useAppContext();

  return (
    <SystemControlSection
      selectedTimePeriod={timePeriod}
      setActiveSection={() => {}}
    />
  );
}
