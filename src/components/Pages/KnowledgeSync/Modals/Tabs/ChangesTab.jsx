"use client";

import EmptyState from "@/components/Shared/Common/EmptyState";
import { fetchSyncChanges } from "@/services";
import { formatTimestamp, getChangeTypeIcon } from "@/utils";
import { ChevronDown, Eye, Loader } from "lucide-react";
import { useEffect, useState } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChangesTab = ({ event, openContentViewModal, openDiffModal }) => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [triedFetching, setTriedFetching] = useState(false);

  // Use a component-level cache to avoid refetching
  const [changesCache, setChangesCache] = useState({});

  // Initial load
  useEffect(() => {
    if (!event || !event.syncId || triedFetching) return;

    // Check if changes are already cached
    if (changesCache[event.syncId]) {
      console.log("Using cached changes for:", event.syncId);
      setChanges(changesCache[event.syncId].changes);
      setNextPageToken(changesCache[event.syncId].nextPageToken);
      return;
    }

    const loadChanges = async () => {
      setLoading(true);
      setError(null);
      try {
        // If event already has changes, use those
        if (event.changes && event.changes.length > 0) {
          setChanges(event.changes);
          setNextPageToken(event.nextChangesPageToken || null);
          
          // Cache them
          setChangesCache(prev => ({
            ...prev, 
            [event.syncId]: {
              changes: event.changes,
              nextPageToken: event.nextChangesPageToken || null
            }
          }));
        } else {
          // Otherwise fetch them
          const result = await fetchSyncChanges(event.syncId, { pageSize: 20 });
          setChanges(result.changes || []);
          setNextPageToken(result.nextPageToken || null);
          
          // Cache them
          setChangesCache(prev => ({
            ...prev, 
            [event.syncId]: {
              changes: result.changes || [],
              nextPageToken: result.nextPageToken || null
            }
          }));
        }
      } catch (err) {
        console.error("Error loading changes:", err);
        setError(`Failed to load changes: ${err.message}`);
      } finally {
        setLoading(false);
        setTriedFetching(true);
      }
    };

    loadChanges();
  }, [event, triedFetching, changesCache]);

  const loadMoreChanges = async () => {
    if (!nextPageToken || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const result = await fetchSyncChanges(event.syncId, { 
        pageSize: 20, 
        pageToken: nextPageToken 
      });
      
      const newChanges = [...changes, ...(result.changes || [])];
      setChanges(newChanges);
      setNextPageToken(result.nextPageToken || null);
      
      // Update cache with the new combined changes
      setChangesCache(prev => ({
        ...prev,
        [event.syncId]: {
          changes: newChanges,
          nextPageToken: result.nextPageToken || null
        }
      }));
    } catch (err) {
      console.error("Error loading more changes:", err);
      alert(`Failed to load more changes: ${err.message}`);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading changes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!changes || changes.length === 0) {
    return <EmptyState message="No page changes recorded for this sync." />;
  }

  return (
    <div className="space-y-4">
      {changes.map(change => (
        <div key={change.changeId || `${change.pageId}-${change.type}-${change.timestamp}`} className="p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center">
              {getChangeTypeIcon(change.type)}
              <span className="ml-2 font-semibold text-gray-800 capitalize">{change.type}</span>
            </div>
            <span className="text-xs text-gray-400">{formatTimestamp(change.timestamp, 'time')}</span>
          </div>
          <p 
            className="text-sm text-blue-600 hover:underline cursor-pointer font-medium mb-0.5"
            onClick={() => {
              if (change.s3HtmlPath) {
                openContentViewModal(change.pageName || `Page ${change.pageId}`, change.pageId, 'HTML', change.s3HtmlPath);
              } else {
                openContentViewModal(change.pageName || `Page ${change.pageId}`, change.pageId, 'HTML');
              }
            }}
          >
            {change.pageName || `Page ${change.pageId}`}
          </p>
          <p className="text-xs text-gray-500 mb-2">ID: {change.pageId}</p>
          
          {change.summary && (
            <div className="mt-1 p-2.5 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-600 mb-1">Update Summary:</h4>
              <div className="prose prose-sm max-w-none text-gray-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{change.summary}</ReactMarkdown>
              </div>
            </div>
          )}
          
          {change.type === 'updated' && change.s3HtmlPathOld && change.s3HtmlPathNew && (
            <button 
              onClick={() => openDiffModal(
                change.pageId, 
                change.pageId, 
                change.pageName || `Previous: ${change.pageId}`, 
                change.pageName || `New: ${change.pageId}`,
                change.s3HtmlPathOld,
                change.s3HtmlPathNew
              )}
              className="mt-2 text-xs text-blue-600 hover:underline flex items-center"
            >
              <Eye size={14} className="mr-1"/> View Content Diff
            </button>
          )}
        </div>
      ))}
      
      {nextPageToken && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMoreChanges}
            disabled={loadingMore}
            className={`px-4 py-2 flex items-center text-sm rounded-md ${
              loadingMore 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {loadingMore ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Loading more...
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-2" />
                Load More Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChangesTab;