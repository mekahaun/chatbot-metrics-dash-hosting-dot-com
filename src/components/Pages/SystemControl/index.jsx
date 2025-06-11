"use client";

import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";
import { getRoutes, getFullUrl } from "@/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const SystemControl = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [isToggling, setIsToggling] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingToggle, setPendingToggle] = useState(null);

  const { agentStatusApiPath, agentControlApiPath } = getRoutes();

  const handleAgentToggle = async (agentName, currentStatus) => {
    const agent = agentData?.agentDetails[agentName];
    const action = currentStatus ? "disable" : "enable";

    const confirmMessage = `Are you sure you want to ${action} ${
      agent?.displayName
    }?${
      currentStatus
        ? "\nThis will prevent the agent from processing any new requests."
        : ""
    }`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const toastId = toast.loading(
      `${action === "enable" ? "Enabling" : "Disabling"} ${
        agent?.displayName
      }...`
    );
    setIsToggling((prev) => ({ ...prev, [agentName]: true }));

    try {
      const endpoint = getFullUrl(agentControlApiPath);

      const payload = {
        agentName,
        action,
        ...(action === "disable" && {
          disabledBy: "admin_user", // This should come from your auth system
          reason: "Manual control", // This should be customizable
        }),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state immediately after successful API call
      setAgentData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          agentDetails: {
            ...prev.agentDetails,
            [agentName]: {
              ...prev.agentDetails[agentName],
              isActive: !currentStatus,
            },
          },
        };
      });

      toast.success(
        `${agent?.displayName} ${
          action === "enable" ? "enabled" : "disabled"
        } successfully`,
        {
          id: toastId,
        }
      );
    } catch (error) {
      console.error("Error toggling agent:", error);
      toast.error(
        `Failed to ${action} ${agent?.displayName}. Please try again.`,
        {
          id: toastId,
        }
      );
    } finally {
      setIsToggling((prev) => ({ ...prev, [agentName]: false }));
    }
  };

  const fetchAgentStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getFullUrl(agentStatusApiPath));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAgentData(data);
    } catch (error) {
      setIsError(true);
      console.error("Error fetching agent status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentStatus();
  }, []);

  if (isLoading) {
    return <LoadingSection />;
  }

  if (isError) {
    return <ErrorSection />;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agent Status Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Agent Status</h3>
          <div className="space-y-4">
            {agentData?.toggleableAgents.map((agentName) => {
              const agent = agentData.agentDetails[agentName];
              return (
                <div
                  key={agentName}
                  className="flex justify-between items-center"
                >
                  <div>
                    <span className="text-gray-600">{agent.displayName}</span>
                    {agent.disabledBy && (
                      <p className="text-xs text-gray-500">
                        Disabled by {agent.disabledBy} - {agent.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        agent.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={agent.isActive}
                        onChange={() =>
                          handleAgentToggle(agentName, agent.isActive)
                        }
                        disabled={isToggling[agentName]}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Agents Status Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Core Agents</h3>
          <div className="space-y-4">
            {agentData?.coreAgents.map((agentName) => {
              const agent = agentData.agentDetails[agentName];
              return (
                <div
                  key={agentName}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-600">{agent.displayName}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      agent.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {agent.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemControl;
