"use client";

import { useAppContext } from "../../../components/AppContext";
import ActivityLogSection from "../sections/ActivityLogSection";

export default function ActivityLogsPage() {
  const { timePeriod } = useAppContext();

  return (
    <ActivityLogSection
      selectedTimePeriod={timePeriod}
      setActiveSection={() => {}}
    />
  );
}
