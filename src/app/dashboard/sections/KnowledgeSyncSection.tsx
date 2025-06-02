// @ts-nocheck

"use client";

import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  XCircle,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchFileContent,
  fetchSyncEventDetail,
  fetchSyncEventsByPage,
  fetchSyncLogUrl,
} from "../../../components/lib/apiService";
import { Error, LoadingSpinner } from "../../../components/lib/utils";
import SyncDetailModal from "../../../components/modals/SyncDetailModal";
import ContentViewModal from "../../../components/modals/ContentViewModal";
import DiffModal from "../../../components/modals/DiffModal";
import FullLogModal from "../../../components/modals/FullLogModal";
import { mockSyncOperations } from "../mockData/knowledgeSyncData"; // Using mock data
import type { SectionProps, SyncOperation } from "../types";

const ITEMS_PER_PAGE = 5;

// Simplified Timeline Component (can be expanded or replaced with ActivityTimeline if suitable)
// const SyncEventTimeline: React.FC<{ events: SyncEventType[] }> = ({
//   events,
// }) => {
//   if (!events || events.length === 0) {
//     return (
//       <p className="text-sm text-gray-500 p-3">
//         No events for this sync operation.
//       </p>
//     );
//   }
//   return (
//     <div className="p-4 bg-gray-50/50 h-full">
//       <h4 className="text-base font-semibold text-gray-800 mb-3">
//         Sync Event Log
//       </h4>
//       <div className="space-y-3">
//         {events.map((event, index) => {
//           let IconComponent;
//           let iconColor = "text-gray-500";
//           switch (event.status) {
//             case "success":
//               IconComponent = CheckCircle2;
//               iconColor = "text-green-500";
//               break;
//             case "failure":
//               IconComponent = XCircle;
//               iconColor = "text-red-500";
//               break;
//             case "warning":
//               IconComponent = AlertTriangle;
//               iconColor = "text-yellow-500";
//               break;
//             default:
//               IconComponent = Info;
//               iconColor = "text-blue-500";
//               break;
//           }
//           return (
//             <div key={event.id} className="flex items-start text-xs">
//               <IconComponent
//                 className={`w-3.5 h-3.5 mr-2 mt-0.5 flex-shrink-0 ${iconColor}`}
//               />
//               <div className="flex-grow">
//                 <p className="font-medium text-gray-700">{event.description}</p>
//                 <p className="text-gray-500">
//                   {format(parseISO(event.timestamp), "MMM d, HH:mm:ss")}
//                 </p>
//                 {event.details && (
//                   <pre className="mt-1 p-1.5 bg-gray-50 text-gray-600 text-xs rounded-md whitespace-pre-wrap break-all">
//                     {JSON.stringify(event.details, null, 2)}
//                   </pre>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// const SyncedContentDetails: React.FC<{
//   content: SyncOperation["syncedContentPreview"];
//   operationStatus: SyncOperation["status"];
// }> = ({ content, operationStatus }) => {
//   const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
//     new Set()
//   );

//   if (!content || content.length === 0) {
//     if (operationStatus === "failure") {
//       return (
//         <p className="text-sm text-gray-500 p-4">
//           Sync operation failed, no content to display.
//         </p>
//       );
//     }
//     return (
//       <p className="text-sm text-gray-500 p-4">
//         No specific content changes were recorded for this sync operation.
//       </p>
//     );
//   }

//   const toggleCategory = (categoryName: string) => {
//     const newExpanded = new Set(expandedCategories);
//     if (newExpanded.has(categoryName)) {
//       newExpanded.delete(categoryName);
//     } else {
//       newExpanded.add(categoryName);
//     }
//     setExpandedCategories(newExpanded);
//   };

//   const getStatusIconAndColor = (status: string) => {
//     if (
//       status.toLowerCase().includes("synced") &&
//       !status.toLowerCase().includes("issue") &&
//       !status.toLowerCase().includes("warning") &&
//       !status.toLowerCase().includes("fail")
//     ) {
//       return {
//         Icon: CheckCircle2,
//         color: "text-green-500",
//         bgColor: "bg-green-50",
//       };
//     }
//     if (
//       status.toLowerCase().includes("warning") ||
//       status.toLowerCase().includes("issue") ||
//       status.toLowerCase().includes("missing")
//     ) {
//       return {
//         Icon: AlertTriangle,
//         color: "text-yellow-500",
//         bgColor: "bg-yellow-50",
//       };
//     }
//     if (status.toLowerCase().includes("fail")) {
//       return { Icon: XCircle, color: "text-red-500", bgColor: "bg-red-50" };
//     }
//     return { Icon: Info, color: "text-blue-500", bgColor: "bg-blue-50" }; // Default
//   };

//   // Group only articles by category, ignore standalone categories
//   const articlesByCategory = content
//     .filter((item) => item.itemType === "article")
//     .reduce((acc, item) => {
//       const categoryName = item.parentCategory || "Uncategorized";
//       if (!acc[categoryName]) {
//         acc[categoryName] = [];
//       }
//       acc[categoryName].push(item);
//       return acc;
//     }, {} as Record<string, typeof content>);

//   const counts = content.reduce(
//     (acc, item) => {
//       const { status } = item;
//       if (
//         status.toLowerCase().includes("synced") &&
//         !status.toLowerCase().includes("issue") &&
//         !status.toLowerCase().includes("warning") &&
//         !status.toLowerCase().includes("fail")
//       ) {
//         acc.successful = (acc.successful || 0) + 1;
//       } else if (
//         status.toLowerCase().includes("warning") ||
//         status.toLowerCase().includes("issue") ||
//         status.toLowerCase().includes("missing")
//       ) {
//         acc.withIssues = (acc.withIssues || 0) + 1;
//       } else if (status.toLowerCase().includes("fail")) {
//         acc.failed = (acc.failed || 0) + 1;
//       } else {
//         acc.other = (acc.other || 0) + 1;
//       }
//       return acc;
//     },
//     { successful: 0, withIssues: 0, failed: 0, other: 0 }
//   );

//   return (
//     <div className="p-4 bg-gray-50/50 h-full">
//       <h4 className="text-base font-semibold text-gray-800 mb-3">
//         Content Sync Details
//       </h4>

//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
//         <div className="bg-green-50 p-2 rounded-md">
//           <p className="font-medium text-green-700">Successfully Synced</p>
//           <p className="text-lg font-semibold text-green-600">
//             {counts.successful}
//           </p>
//         </div>
//         <div className="bg-yellow-50 p-2 rounded-md">
//           <p className="font-medium text-yellow-700">Synced with Issues</p>
//           <p className="text-lg font-semibold text-yellow-600">
//             {counts.withIssues}
//           </p>
//         </div>
//         <div className="bg-red-50 p-2 rounded-md">
//           <p className="font-medium text-red-700">Failed to Sync</p>
//           <p className="text-lg font-semibold text-red-600">{counts.failed}</p>
//         </div>
//         <div className="bg-blue-50 p-2 rounded-md">
//           <p className="font-medium text-blue-700">Other Status</p>
//           <p className="text-lg font-semibold text-blue-600">{counts.other}</p>
//         </div>
//       </div>

//       {Object.keys(articlesByCategory).length > 0 && (
//         <div className="space-y-3 mt-4">
//           <h5 className="text-sm font-medium text-gray-600 mb-2">
//             Articles by Category:
//           </h5>

//           {Object.entries(articlesByCategory).map(
//             ([categoryName, articles]) => {
//               const isExpanded = expandedCategories.has(categoryName);
//               const categoryItemCount = articles.length;

//               // Calculate status counts for this category
//               const categoryStatusCounts = articles.reduce(
//                 (acc, article) => {
//                   const { status } = article;
//                   if (
//                     status.toLowerCase().includes("synced") &&
//                     !status.toLowerCase().includes("issue") &&
//                     !status.toLowerCase().includes("warning") &&
//                     !status.toLowerCase().includes("fail")
//                   ) {
//                     acc.successful += 1;
//                   } else if (
//                     status.toLowerCase().includes("warning") ||
//                     status.toLowerCase().includes("issue") ||
//                     status.toLowerCase().includes("missing")
//                   ) {
//                     acc.withIssues += 1;
//                   } else if (status.toLowerCase().includes("fail")) {
//                     acc.failed += 1;
//                   } else {
//                     acc.other += 1;
//                   }
//                   return acc;
//                 },
//                 { successful: 0, withIssues: 0, failed: 0, other: 0 }
//               );

//               return (
//                 <div key={categoryName} className="mb-3">
//                   {/* Category Header - Clickable */}
//                   <div
//                     className="bg-white p-3 rounded-md cursor-pointer hover:bg-gray-50 border border-gray-200 shadow-sm flex items-center justify-between"
//                     onClick={() => toggleCategory(categoryName)}
//                   >
//                     <div className="flex items-center">
//                       {isExpanded ? (
//                         <ChevronDown className="w-4 h-4 mr-2 text-gray-600" />
//                       ) : (
//                         <ChevronRight className="w-4 h-4 mr-2 text-gray-600" />
//                       )}
//                       <div>
//                         <h6 className="text-sm font-semibold text-gray-800">
//                           {categoryName}
//                         </h6>
//                         <div className="flex items-center space-x-4 mt-1">
//                           <span className="text-xs text-gray-600">
//                             {categoryItemCount} items
//                           </span>
//                           {categoryStatusCounts.successful > 0 && (
//                             <span className="text-xs text-green-600 font-medium">
//                               {categoryStatusCounts.successful} success
//                             </span>
//                           )}
//                           {categoryStatusCounts.withIssues > 0 && (
//                             <span className="text-xs text-yellow-600 font-medium">
//                               {categoryStatusCounts.withIssues} issues
//                             </span>
//                           )}
//                           {categoryStatusCounts.failed > 0 && (
//                             <span className="text-xs text-red-600 font-medium">
//                               {categoryStatusCounts.failed} failed
//                             </span>
//                           )}
//                           {categoryStatusCounts.other > 0 && (
//                             <span className="text-xs text-blue-600 font-medium">
//                               {categoryStatusCounts.other} other
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {isExpanded ? "Click to collapse" : "Click to expand"}
//                     </div>
//                   </div>

//                   {/* Articles in Category - Collapsible */}
//                   {isExpanded && (
//                     <div className="ml-6 mt-2 space-y-2">
//                       {articles.map((item) => {
//                         const { Icon, color, bgColor } = getStatusIconAndColor(
//                           item.status
//                         );
//                         return (
//                           <div
//                             key={item.id}
//                             className={`p-2.5 rounded-md border ${bgColor.replace(
//                               "bg-",
//                               "border-"
//                             )} flex items-center justify-between`}
//                           >
//                             <div className="flex items-center">
//                               <Icon
//                                 className={`w-4 h-4 mr-2 flex-shrink-0 ${color}`}
//                               />
//                               <div>
//                                 <p className="text-sm font-medium text-gray-800">
//                                   {item.title}
//                                 </p>
//                                 <p className="text-xs text-gray-500">
//                                   ID: {item.id} • Type:{" "}
//                                   {item.itemType.charAt(0).toUpperCase() +
//                                     item.itemType.slice(1)}{" "}
//                                   ({item.type}) • Action:{" "}
//                                   {item.action.charAt(0).toUpperCase() +
//                                     item.action.slice(1)}
//                                 </p>
//                               </div>
//                             </div>
//                             <span
//                               className={`text-xs font-medium px-2 py-0.5 rounded-full ${bgColor} ${color
//                                 .replace("text-", "text-")
//                                 .replace("-500", "-700")}`}
//                             >
//                               {item.status}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             }
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

const KnowledgeSyncSection: React.FC<SectionProps> = ({
  selectedTimePeriod,
}) => {
  const [syncEvents, setSyncEvents] = useState([]);
  const [upcomingSyncTime, setUpcomingSyncTime] = useState(null);
  const [currentView, setCurrentView] = useState("card");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setError] = useState(null);
  const [expandedOperationId, setExpandedOperationId] = useState<string | null>(
    null
  );
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>(
    [...mockSyncOperations].sort(
      (a, b) =>
        parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()
    )
  );

  const fetchSyncEventsDataByPage = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Fetching events for page ${page} with size ${pageSize}`);
      const result = await fetchSyncEventsByPage(page, { pageSize: 20 }); // Hardcoded to 20 items per page

      // Extract events data
      const events = result.syncs || [];

      console.log({ events });

      const processedEvents = events?.map((eventItem: any) => {
        const date = eventItem?.endTime && new Date(eventItem?.endTime);
        const relativeTime =
          date && formatDistanceToNow(date, { addSuffix: true });
        const formattedEndTime = date && format(date, "MMM d, yyyy");

        const processedEventItem = {
          ...eventItem,
          relativeTime,
          endTime: formattedEndTime,
        };

        return processedEventItem;
      });

      setSyncEvents(processedEvents);

      // Calculate total pages
      // If the API doesn't provide a total count, we use a simple approach
      // where we assume there are more pages if we got a full page of results
      const calculatedTotalPages =
        result.totalPages ||
        Math.max(events.length === 20 ? page + 1 : page, 5);
      setTotalPages(calculatedTotalPages);

      // Cache this page data
      // setPageCache(prev => ({
      //   ...prev,
      //   [cacheKey]: {
      //     events,
      //     totalPages: calculatedTotalPages
      //   }
      // }));
    } catch (err) {
      console.error(`Error loading events for page ${page}:`, err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncEventsDataByPage();
  }, []);

  // TODO - Place SyncDetail Modal Stuffs Here
  const [selectedSyncEventId, setSelectedSyncEventId] = useState(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalActiveTab, setDetailModalActiveTab] = useState("Overview");
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [isContentViewModalOpen, setIsContentViewModalOpen] = useState(false);
  const [contentViewModalData, setContentViewModalData] = useState({
    title: "",
    content: "",
    type: "HTML",
    pageId: "",
  });
  const [isContentLoading, setIsContentLoading] = useState(false);

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

  const [isFullLogModalOpen, setIsFullLogModalOpen] = useState(false);
  const [fullLogModalContent, setFullLogModalContent] = useState("");
  const [fullLogSearchTerm, setFullLogSearchTerm] = useState("");
  const [isLogLoading, setIsLogLoading] = useState(false);
  const fullLogRef = useRef(null);

  // Cache for content data
  const [contentCache, setContentCache] = useState({});
  // Cache for log data
  const [logCache, setLogCache] = useState({});
  // Cache for event details
  const [eventDetailsCache, setEventDetailsCache] = useState({});
  // Cache for page data
  const [pageCache, setPageCache] = useState({});

  // For modal management - store active modals stack
  const [activeModals, setActiveModals] = useState([]);

  // Modal management helpers
  const addModal = useCallback((modalType) => {
    setActiveModals((prev) => [...prev, modalType]);
  }, []);

  const removeModal = useCallback((modalType) => {
    setActiveModals((prev) => prev.filter((m) => m !== modalType));
  }, []);

  const openSyncDetailModal = async (syncId) => {
    // First set the modal open to improve perceived performance
    console.log("Hi there");
    setSelectedSyncEventId(syncId);
    setDetailModalActiveTab("Overview");
    setIsDetailModalOpen(true);
    addModal("syncDetail");

    // Check if we have cached details
    if (eventDetailsCache[syncId]) {
      console.log("Using cached event details for:", syncId);
      setSelectedEventDetails(eventDetailsCache[syncId]);
      return;
    }

    // Otherwise fetch details
    setIsDetailLoading(true);

    try {
      const eventDetails = await fetchSyncEventDetail(syncId);
      setSelectedEventDetails(eventDetails);

      // Cache the details
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
  };

  const closeSyncDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedSyncEventId(null);
    setSelectedEventDetails(null);
    removeModal("syncDetail");
  }, [removeModal]);

  const openContentViewModal = useCallback(
    async (title, pageId, type = "HTML", s3Path = null) => {
      // Generate a unique cache key
      const cacheKey = `${type}-${s3Path || pageId}`;

      // Open modal immediately with loading state for better UX
      setContentViewModalData({ title, content: "", type, pageId });
      setIsContentViewModalOpen(true);
      addModal("contentView");

      // Check if content is already cached
      if (contentCache[cacheKey]) {
        console.log("Using cached content for:", cacheKey);
        setContentViewModalData((prev) => ({
          ...prev,
          content: contentCache[cacheKey],
        }));
        return;
      }

      // Otherwise fetch content
      setIsContentLoading(true);

      try {
        // If s3Path is provided, use it to fetch content
        if (s3Path) {
          const content = await fetchFileContent(s3Path);
          console.log({ content });
          setContentViewModalData((prev) => ({ ...prev, content }));

          // Cache the content
          setContentCache((prev) => ({
            ...prev,
            [cacheKey]: content,
          }));
        } else {
          // For now, just set a message that content can't be loaded without S3 path
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

  const openDiffModal = useCallback(
    async (
      pageIdOld,
      pageIdNew,
      titleOld,
      titleNew,
      s3PathOld = null,
      s3PathNew = null
    ) => {
      // Generate unique cache keys
      const cacheKeyOld = `HTML-${s3PathOld || pageIdOld}`;
      const cacheKeyNew = `HTML-${s3PathNew || pageIdNew}`;

      // Set initial modal state for better UX
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

      // Check if we need to fetch either content
      const needToFetchOld = !contentCache[cacheKeyOld] && s3PathOld;
      const needToFetchNew = !contentCache[cacheKeyNew] && s3PathNew;

      if (needToFetchOld || needToFetchNew) {
        setIsDiffLoading(true);

        try {
          let oldContent = "Content not available";
          let newContent = "Content not available";

          // Fetch old content if needed
          if (needToFetchOld) {
            oldContent = await fetchFileContent(s3PathOld);
            // Cache the content
            setContentCache((prev) => ({
              ...prev,
              [cacheKeyOld]: oldContent,
            }));
          } else if (contentCache[cacheKeyOld]) {
            oldContent = contentCache[cacheKeyOld];
          }

          // Fetch new content if needed
          if (needToFetchNew) {
            newContent = await fetchFileContent(s3PathNew);
            // Cache the content
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
        // Use cached content
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

  const openFullLogModal = useCallback(
    async (syncId) => {
      // Check if we have cached log content
      if (logCache[syncId]) {
        console.log("Using cached log content for:", syncId);
        setFullLogModalContent(logCache[syncId]);
        setFullLogSearchTerm("");
        setIsFullLogModalOpen(true);
        addModal("fullLog");
        return;
      }

      // Otherwise fetch log content
      setFullLogModalContent("");
      setFullLogSearchTerm("");
      setIsFullLogModalOpen(true);
      addModal("fullLog");
      setIsLogLoading(true);

      try {
        console.log("Fetching log URL for syncId:", syncId);
        const logUrlData = await fetchSyncLogUrl(syncId);
        console.log("Log URL data received:", logUrlData);

        if (logUrlData.signedUrl) {
          // Now fetch the actual log content
          console.log("Fetching from signed URL:", logUrlData.signedUrl);
          try {
            const response = await fetch(logUrlData.signedUrl);
            if (!response.ok) {
              throw new Error(
                `HTTP error ${response.status}: ${response.statusText}`
              );
            }
            const logText = await response.text();
            console.log("Log text received, length:", logText.length);
            setFullLogModalContent(logText);

            // Cache the log content
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
          console.warn("No signed URL in response");
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

  // END - Modal Handlers

  // const toggleExpand = (operationId: string) => {
  //   setExpandedOperationId(
  //     expandedOperationId === operationId ? null : operationId
  //   );
  // };

  // Operations are now sourced from state and already sorted.
  // Add filtering by selectedTimePeriod here if needed in the future.
  const filteredOperations = useMemo(() => {
    return syncEvents || [];
    // Example for future filtering:
    // return syncOperations.filter(op => matchesTimePeriod(op.timestamp, selectedTimePeriod));
  }, [syncEvents, selectedTimePeriod]);

  // Placeholder for next sync time
  // const nextScheduledSyncTime = useMemo(() => {
  //   // For demonstration, let's assume next sync is 4 hours from the latest operation or now if no operations
  //   const lastOpTime =
  //     filteredOperations.length > 0
  //       ? parseISO(filteredOperations[0].timestamp)
  //       : new Date();
  //   return addHours(lastOpTime, 4);
  // }, [filteredOperations]);

  // const totalPages = Math.ceil(filteredOperations.length / ITEMS_PER_PAGE);
  const paginatedOperations = filteredOperations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  // const handleManualSync = () => {
  //   const newOperationId = `sync-${Date.now()}`;
  //   const now = new Date();

  //   const inProgressOperation: SyncOperation = {
  //     id: newOperationId,
  //     timestamp: now.toISOString(),
  //     status: "in_progress",
  //     triggerType: "manual",
  //     duration: 0, // Will be updated
  //     stats: {
  //       documentsProcessed: 0,
  //       pagesCreated: 0,
  //       pagesUpdated: 0,
  //       pagesDeleted: 0,
  //       versionConflicts: 0,
  //       errorsEncountered: 0,
  //     },
  //     events: [
  //       {
  //         id: `evt-${Date.now()}-1`,
  //         timestamp: now.toISOString(),
  //         type: "SyncInitiated",
  //         status: "info",
  //         description: "Manual sync process started.",
  //         details: { user: "current_user" },
  //       },
  //     ],
  //     syncedContentPreview: [],
  //   };

  //   setSyncOperations((prevOps: SyncOperation[]) =>
  //     [inProgressOperation, ...prevOps].sort(
  //       (a: SyncOperation, b: SyncOperation) =>
  //         parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()
  //     )
  //   );

  //   setTimeout(() => {
  //     const endTime = new Date();
  //     const durationMs = endTime.getTime() - now.getTime();
  //     const randomStatus =
  //       Math.random() < 0.8 ? "completed" : "completed_with_errors"; // 80% chance of success
  //     const errorsEncountered =
  //       randomStatus === "completed_with_errors"
  //         ? Math.floor(Math.random() * 5) + 1
  //         : 0;
  //     const documentsProcessed = Math.floor(Math.random() * 100) + 50;

  //     const completedOperation: SyncOperation = {
  //       ...inProgressOperation,
  //       status: randomStatus,
  //       duration: durationMs,
  //       stats: {
  //         documentsProcessed: documentsProcessed,
  //         pagesCreated: Math.floor(Math.random() * (documentsProcessed / 2)),
  //         pagesUpdated: Math.floor(Math.random() * (documentsProcessed / 2)),
  //         pagesDeleted: Math.floor(Math.random() * 10),
  //         versionConflicts: Math.floor(Math.random() * 5),
  //         errorsEncountered: errorsEncountered,
  //       },
  //       events: [
  //         ...inProgressOperation.events,
  //         {
  //           id: `evt-${Date.now()}-2`,
  //           timestamp: endTime.toISOString(),
  //           type: "SyncPhaseComplete",
  //           status: "info",
  //           description: "Content processing finished.",
  //           details: { phase: "data_extraction" },
  //         },
  //         {
  //           id: `evt-${Date.now()}-3`,
  //           timestamp: endTime.toISOString(),
  //           type:
  //             randomStatus === "completed" ? "SyncCompleted" : "SyncWarning",
  //           status: randomStatus === "completed" ? "success" : "warning",
  //           description: `Manual sync finished ${
  //             randomStatus === "completed" ? "successfully" : "with errors"
  //           }.`,
  //           details: { outcome: randomStatus },
  //         },
  //       ],
  //       syncedContentPreview: [
  //         {
  //           id: `content-${Date.now()}-1`,
  //           title: "New FAQ Article: Returns Policy",
  //           type: "FAQ",
  //           status: errorsEncountered > 0 ? "Synced with issues" : "Synced",
  //           itemType: "article",
  //           action: "created",
  //           parentCategory: "Customer Support FAQs",
  //         },
  //         {
  //           id: `content-${Date.now()}-2`,
  //           title: "Updated Guide: Getting Started",
  //           type: "Guide",
  //           status: "Synced",
  //           itemType: "article",
  //           action: "updated",
  //           parentCategory: "Product Guides",
  //         },
  //       ].slice(0, Math.floor(Math.random() * 3)), // 0 to 2 items
  //     };

  //     setSyncOperations((prevOps: SyncOperation[]) =>
  //       prevOps
  //         .map((op: SyncOperation) =>
  //           op.id === newOperationId ? completedOperation : op
  //         )
  //         .sort(
  //           (a: SyncOperation, b: SyncOperation) =>
  //             parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()
  //         )
  //     );
  //   }, 3000 + Math.random() * 2000); // Simulate 3-5 seconds of processing
  // };

  const getStatusIcon = (status: SyncOperation["status"]) => {
    if (status === "completed")
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === "failure")
      return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === "completed_with_errors")
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    if (status === "in_progress")
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    return <Info className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Sync Control Bar */}
        {/* <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={18} className="mr-2 text-gray-500" />
            Next scheduled sync:
            <span className="font-medium text-gray-700 ml-1">
              {format(nextScheduledSyncTime, "MMM d, yyyy HH:mm")}
            </span>
            <span className="text-gray-500 ml-1">
              ({formatDistanceToNow(nextScheduledSyncTime, { addSuffix: true })}
              )
            </span>
          </div>
          <button
            onClick={handleManualSync}
            className="flex items-center justify-center text-sm px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw size={16} className="mr-2" />
            Sync Now
          </button>
        </div> */}

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

export default KnowledgeSyncSection;
