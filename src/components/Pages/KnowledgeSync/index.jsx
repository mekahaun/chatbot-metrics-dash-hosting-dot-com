"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import ErrorSection from "@/components/Shared/Common/Errors/ErrorSection";
import LoadingSection from "@/components/Shared/Common/Loaders/LoadingSection";

import ContentViewModal from "@/components/Pages/KnowledgeSync/Modals/ContentViewModal";
import DiffModal from "@/components/Pages/KnowledgeSync/Modals/DiffModal";
import FullLogModal from "@/components/Pages/KnowledgeSync/Modals/FullLogModal";
import SyncDetailModal from "@/components/Pages/KnowledgeSync/Modals/SyncDetailModal";

import { useKnowledgeSync } from "./useKnowledgeSync";

const KnowledgeSync = () => {
  const {
    // State
    currentView,
    setCurrentView,
    isLoading,
    isError,
    expandedOperationId,
    setExpandedOperationId,
    syncEvents,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    setPageSize,
    selectedSyncEventId,
    selectedEventDetails,
    isDetailModalOpen,
    detailModalActiveTab,
    setDetailModalActiveTab,
    isDetailLoading,
    isContentViewModalOpen,
    contentViewModalData,
    isContentLoading,
    isDiffModalOpen,
    diffModalData,
    isDiffLoading,
    isFullLogModalOpen,
    fullLogModalContent,
    fullLogSearchTerm,
    setFullLogSearchTerm,
    isLogLoading,
    fullLogRef,

    // Modal handlers
    openSyncDetailModal,
    closeSyncDetailModal,
    openContentViewModal,
    closeContentViewModal,
    openDiffModal,
    closeDiffModal,
    openFullLogModal,
    closeFullLogModal,

    // Data fetching
    fetchSyncEventsDataByPage,

    // Computed values
    filteredOperations,
    paginatedOperations,
    getStatusIcon,
  } = useKnowledgeSync();

  const ITEMS_PER_PAGE = 5;

  const [contentCache, setContentCache] = useState({});
  const [logCache, setLogCache] = useState({});
  const [eventDetailsCache, setEventDetailsCache] = useState({});
  const [pageCache, setPageCache] = useState({});
  const [activeModals, setActiveModals] = useState([]);

  // Modal management helpers
  const addModal = useCallback((modalType) => {
    setActiveModals((prev) => [...prev, modalType]);
  }, []);

  const removeModal = useCallback((modalType) => {
    setActiveModals((prev) => prev.filter((m) => m !== modalType));
  }, []);

  useEffect(() => {
    fetchSyncEventsDataByPage();
  }, [fetchSyncEventsDataByPage]);

  if (isLoading) {
    return <LoadingSection />;
  }

  if (isError) {
    return <ErrorSection />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Pagination Controls Top */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {paginatedOperations.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">
              No knowledge sync operations to display for this period.
            </p>
          </div>
        )}

        {syncEvents?.map((op) => {
          const isExpanded = expandedOperationId === op.id;
          return (
            <div
              key={op?.syncId}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div
                className={`p-3 cursor-pointer flex items-center justify-between ${
                  isExpanded ? "bg-gray-50" : "hover:bg-gray-50"
                }`}
                onClick={() => openSyncDetailModal(op?.syncId)}
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(op?.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      #{op?.syncId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {op?.relativeTime}, {op?.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span
                    title={`Trigger: ${op?.triggerType}`}
                    className="flex items-center text-gray-600"
                  >
                    <RefreshCw size={14} className="mr-1 text-gray-400" />{" "}
                    {op?.triggerType}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Move SyncDetailModal outside of the map */}
      {isDetailModalOpen && (
        <SyncDetailModal
          event={selectedEventDetails}
          isLoading={isDetailLoading}
          onClose={closeSyncDetailModal}
          openContentViewModal={openContentViewModal}
          openDiffModal={openDiffModal}
          openFullLogModal={openFullLogModal}
          activeTabProp={detailModalActiveTab}
          setActiveTabProp={setDetailModalActiveTab}
        />
      )}

      {isContentViewModalOpen && (
        <ContentViewModal
          title={contentViewModalData.title}
          content={contentViewModalData.content}
          type={contentViewModalData.type}
          pageId={contentViewModalData.pageId}
          onClose={closeContentViewModal}
          isLoading={isContentLoading}
        />
      )}

      {isDiffModalOpen && (
        <DiffModal
          oldContent={diffModalData.oldContent}
          newContent={diffModalData.newContent}
          pageIdOld={diffModalData.pageIdOld}
          pageIdNew={diffModalData.pageIdNew}
          titleOld={diffModalData.titleOld}
          titleNew={diffModalData.titleNew}
          onClose={closeDiffModal}
          isLoading={isDiffLoading}
        />
      )}

      {isFullLogModalOpen && (
        <FullLogModal
          logContent={fullLogModalContent}
          searchTerm={fullLogSearchTerm}
          setSearchTerm={setFullLogSearchTerm}
          logRef={fullLogRef}
          onClose={closeFullLogModal}
          isLoading={isLogLoading}
        />
      )}
    </>
  );
};

export default KnowledgeSync;
