"use client";

import { usePathname, useRouter } from "next/navigation";

const Sidebar = ({ sections }) => {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentSection = () => {
    const path = pathname.split("/").pop();
    return path || "overview";
  };

  const handleSectionClick = (sectionId) => {
    router.push(`/dashboard/${sectionId}`);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-300 h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            {sections.map((section) => {
              const isActive = getCurrentSection() === section.id;
              return (
                <li key={section.id}>
                  <button
                    onClick={() => handleSectionClick(section.id)}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    <span className="text-left">{section.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
