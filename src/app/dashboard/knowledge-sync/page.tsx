"use client";

import { useAppContext } from "../../../components/AppContext";
import KnowledgeSyncSection from "../sections/KnowledgeSyncSection";

export default function KnowledgeSyncPage() {
  const { timePeriod } = useAppContext();

  return (
    <KnowledgeSyncSection
      selectedTimePeriod={timePeriod}
      setActiveSection={() => {}}
    />
  );
}
