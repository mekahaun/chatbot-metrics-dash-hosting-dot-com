"use client";

import { AppProvider } from "@/components/context/AppContext";
import {
  BarChart3,
  BrainCircuit,
  Filter,
  LayoutDashboard,
  ListChecks,
  RefreshCw,
  SearchCode,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Sidebar from "../../components/Shared/Layout/Sidebar";
import TopMenu from "../../components/Shared/Layout/TopMenu";

const sections = [
  { id: "overview", name: "Overview", icon: <LayoutDashboard size={18} /> },
  {
    id: "activity-logs",
    name: "Activity Logs",
    icon: <ListChecks size={18} />,
  },
  {
    id: "ai-performance",
    name: "AI Performance",
    icon: <BrainCircuit size={18} />,
  },
  {
    id: "knowledge-sync",
    name: "Knowledge Sync",
    icon: <RefreshCw size={18} />,
  },
  {
    id: "gap-analysis",
    name: "Gap Analysis",
    icon: <BarChart3 size={18} />,
  },
  {
    id: "system-control",
    name: "System Control",
    icon: <Settings size={18} />,
  },
  {
    id: "conversation-funnel",
    name: "Conversation Funnel (Coming Soon)",
    icon: <Filter size={18} />,
  },
  {
    id: "event-deep-dive",
    name: "Event Deep Dive (Coming Soon)",
    icon: <SearchCode size={18} />,
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const currentSection = sections.find(
    (section) => pathname === `/dashboard/${section.id}`
  );

  return (
    <AppProvider>
      <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
        <Sidebar sections={sections} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopMenu sectionName={currentSection?.name} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </div>
    </AppProvider>
  );
}
