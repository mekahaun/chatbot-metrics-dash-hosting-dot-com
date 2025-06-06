import {
  fetchFileContent,
  fetchSyncEventDetail,
  fetchSyncEventsByPage,
  fetchSyncLogUrl,
} from "@/services";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

export const useKnowledgeSync = () => {
  // View state
  const [currentView, setCurrentView] = useState("card");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setError] = useState(null);
  const [expandedOperationId, setExpandedOperationId] = useState(null);

  // Sync events state
  const [syncEvents, setSyncEvents] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const ITEMS_PER_PAGE = 5;

  // Detail modal state
  const [selectedSyncEventId, setSelectedSyncEventId] = useState(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalActiveTab, setDetailModalActiveTab] = useState("Overview");
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Content view modal state
  const [isContentViewModalOpen, setIsContentViewModalOpen] = useState(false);
  const [contentViewModalData, setContentViewModalData] = useState({
    title: "",
    content: "",
    type: "HTML",
    pageId: "",
  });
  const [isContentLoading, setIsContentLoading] = useState(false);

  // Diff modal state
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [diffModalData, setDiffModalData] = useState({
    oldContent: "",
    newContent: "",
    pageIdOld: "",
    pageIdNew: "",
    titleOld: "",
    titleNew: "",
  });
  const [isDiffLoading, setIsDiffLoading] = useState(false);

  // Full log modal state
  const [isFullLogModalOpen, setIsFullLogModalOpen] = useState(false);
  const [fullLogModalContent, setFullLogModalContent] = useState("");
  const [fullLogSearchTerm, setFullLogSearchTerm] = useState("");
  const [isLogLoading, setIsLogLoading] = useState(false);
  const fullLogRef = useRef(null);

  // Cache states
  const [contentCache, setContentCache] = useState({});
  const [logCache, setLogCache] = useState({});
  const [eventDetailsCache, setEventDetailsCache] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageCache, setPageCache] = useState({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeModals, setActiveModals] = useState([]);

  // Modal management helpers
  const addModal = useCallback((modalType) => {
    setActiveModals((prev) => [...prev, modalType]);
  }, []);

  const removeModal = useCallback((modalType) => {
    setActiveModals((prev) => prev.filter((m) => m !== modalType));
  }, []);

  // Sync detail modal handlers
  const openSyncDetailModal = useCallback(
    async (syncId) => {
      setSelectedSyncEventId(syncId);
      setDetailModalActiveTab("Overview");
      setIsDetailModalOpen(true);
      addModal("syncDetail");

      if (eventDetailsCache[syncId]) {
        setSelectedEventDetails(eventDetailsCache[syncId]);
        return;
      }

      setIsDetailLoading(true);

      try {
        const eventDetails = await fetchSyncEventDetail(syncId);
        setSelectedEventDetails(eventDetails);
        setEventDetailsCache((prev) => ({
          ...prev,
          [syncId]: eventDetails,
        }));
      } catch (error) {
        console.error("Error fetching sync details:", error);
        setSelectedEventDetails(null);
        alert(`Failed to load sync details: ${error.message}`);
      } finally {
        setIsDetailLoading(false);
      }
    },
    [eventDetailsCache, addModal]
  );

  const closeSyncDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedSyncEventId(null);
    setSelectedEventDetails(null);
    removeModal("syncDetail");
  }, [removeModal]);

  // Content view modal handlers
  const openContentViewModal = useCallback(
    async (title, pageId, type = "HTML", s3Path = null) => {
      const cacheKey = `${type}-${s3Path || pageId}`;

      setContentViewModalData({ title, content: "", type, pageId });
      setIsContentViewModalOpen(true);
      addModal("contentView");

      if (contentCache[cacheKey]) {
        setContentViewModalData((prev) => ({
          ...prev,
          content: contentCache[cacheKey],
        }));
        return;
      }

      setIsContentLoading(true);

      try {
        if (s3Path) {
          const content = await fetchFileContent(s3Path);
          setContentViewModalData((prev) => ({ ...prev, content }));
          setContentCache((prev) => ({
            ...prev,
            [cacheKey]: content,
          }));
        } else {
          setContentViewModalData((prev) => ({
            ...prev,
            content:
              "Content cannot be loaded directly. Use the file links with S3 paths instead.",
          }));
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setContentViewModalData((prev) => ({
          ...prev,
          content: `Error loading content: ${error.message}`,
        }));
      } finally {
        setIsContentLoading(false);
      }
    },
    [contentCache, addModal]
  );

  const closeContentViewModal = useCallback(() => {
    setIsContentViewModalOpen(false);
    removeModal("contentView");
  }, [removeModal]);

  // Diff modal handlers
  const openDiffModal = useCallback(
    async (
      pageIdOld,
      pageIdNew,
      titleOld,
      titleNew,
      s3PathOld = null,
      s3PathNew = null
    ) => {
      const cacheKeyOld = `HTML-${s3PathOld || pageIdOld}`;
      const cacheKeyNew = `HTML-${s3PathNew || pageIdNew}`;

      setDiffModalData({
        oldContent: "",
        newContent: "",
        pageIdOld,
        pageIdNew,
        titleOld,
        titleNew,
      });
      setIsDiffModalOpen(true);
      addModal("diff");

      const needToFetchOld = !contentCache[cacheKeyOld] && s3PathOld;
      const needToFetchNew = !contentCache[cacheKeyNew] && s3PathNew;

      if (needToFetchOld || needToFetchNew) {
        setIsDiffLoading(true);

        try {
          let oldContent = "Content not available";
          let newContent = "Content not available";

          if (needToFetchOld) {
            oldContent = await fetchFileContent(s3PathOld);
            setContentCache((prev) => ({
              ...prev,
              [cacheKeyOld]: oldContent,
            }));
          } else if (contentCache[cacheKeyOld]) {
            oldContent = contentCache[cacheKeyOld];
          }

          if (needToFetchNew) {
            newContent = await fetchFileContent(s3PathNew);
            setContentCache((prev) => ({
              ...prev,
              [cacheKeyNew]: newContent,
            }));
          } else if (contentCache[cacheKeyNew]) {
            newContent = contentCache[cacheKeyNew];
          }

          setDiffModalData((prev) => ({
            ...prev,
            oldContent,
            newContent,
          }));
        } catch (error) {
          console.error("Error fetching diff content:", error);
          setDiffModalData((prev) => ({
            ...prev,
            oldContent: `Error: ${error.message}`,
            newContent: `Error: ${error.message}`,
          }));
        } finally {
          setIsDiffLoading(false);
        }
      } else {
        setDiffModalData((prev) => ({
          ...prev,
          oldContent: contentCache[cacheKeyOld] || "Content not available",
          newContent: contentCache[cacheKeyNew] || "Content not available",
        }));
      }
    },
    [contentCache, addModal]
  );

  const closeDiffModal = useCallback(() => {
    setIsDiffModalOpen(false);
    removeModal("diff");
  }, [removeModal]);

  // Full log modal handlers
  const openFullLogModal = useCallback(
    async (syncId) => {
      if (logCache[syncId]) {
        setFullLogModalContent(logCache[syncId]);
        setFullLogSearchTerm("");
        setIsFullLogModalOpen(true);
        addModal("fullLog");
        return;
      }

      setFullLogModalContent("");
      setFullLogSearchTerm("");
      setIsFullLogModalOpen(true);
      addModal("fullLog");
      setIsLogLoading(true);

      try {
        const logUrlData = await fetchSyncLogUrl(syncId);

        if (logUrlData.signedUrl) {
          try {
            const response = await fetch(logUrlData.signedUrl);
            if (!response.ok) {
              throw new Error(
                `HTTP error ${response.status}: ${response.statusText}`
              );
            }
            const logText = await response.text();
            setFullLogModalContent(logText);
            setLogCache((prev) => ({
              ...prev,
              [syncId]: logText,
            }));
          } catch (fetchError) {
            console.error("Error fetching from signed URL:", fetchError);
            setFullLogModalContent(
              `Error accessing log file: ${fetchError.message}. This may be a CORS issue with the S3 bucket.`
            );
          }
        } else {
          setFullLogModalContent("Log file URL not available in the response");
        }
      } catch (error) {
        console.error("Error fetching log content:", error);
        setFullLogModalContent(`Error loading log: ${error.message}`);
      } finally {
        setIsLogLoading(false);
      }
    },
    [logCache, addModal]
  );

  const closeFullLogModal = useCallback(() => {
    setIsFullLogModalOpen(false);
    setFullLogModalContent("");
    removeModal("fullLog");
  }, [removeModal]);

  // Data fetching
  const fetchSyncEventsDataByPage = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchSyncEventsByPage(page, { pageSize: 20 });

      const events = result.syncs || [];
      const processedEvents = events?.map((eventItem) => {
        const date = eventItem?.endTime && new Date(eventItem?.endTime);
        const relativeTime =
          date && formatDistanceToNow(date, { addSuffix: true });
        const formattedEndTime = date && format(date, "MMM d, yyyy");

        return {
          ...eventItem,
          relativeTime,
          endTime: formattedEndTime,
        };
      });

      setSyncEvents(processedEvents);
      const calculatedTotalPages =
        result.totalPages ||
        Math.max(events.length === 20 ? page + 1 : page, 5);
      setTotalPages(calculatedTotalPages);
    } catch (err) {
      console.error(`Error loading events for page ${page}:`, err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Computed values
  const filteredOperations = useMemo(() => {
    return syncEvents || [];
  }, [syncEvents]);

  const paginatedOperations = useMemo(() => {
    return filteredOperations.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredOperations, currentPage]);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failure":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "completed_with_errors":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "in_progress":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  return {
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
  };
};
