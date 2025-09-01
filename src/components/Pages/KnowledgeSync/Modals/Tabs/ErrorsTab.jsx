"use client";

import EmptyState from "@/components/Shared/Common/EmptyState";
import { fetchSyncErrors } from "@/services";
import { AlertTriangle, ChevronDown, Lightbulb, Loader } from "lucide-react";
import { useEffect, useState } from 'react';

const ErrorsTab = ({ errors: initialErrors, event }) => {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [triedFetching, setTriedFetching] = useState(false);

  // Component-level cache
  const [errorsCache, setErrorsCache] = useState({});

  // Initial load
  useEffect(() => {
    if (!event || !event.syncId || triedFetching) return;

    // Check if errors are already cached
    if (errorsCache[event.syncId]) {
      console.log("Using cached errors for:", event.syncId);
      setErrors(errorsCache[event.syncId].errors);
      setNextPageToken(errorsCache[event.syncId].nextPageToken);
      return;
    }

    const loadErrors = async () => {
      setLoading(true);
      setError(null);
      try {
        // If initial errors are provided, use those
        if (initialErrors && initialErrors.length > 0) {
          setErrors(initialErrors);
          setNextPageToken(event.nextErrorsPageToken || null);
          
          // Cache them
          setErrorsCache(prev => ({
            ...prev,
            [event.syncId]: {
              errors: initialErrors,
              nextPageToken: event.nextErrorsPageToken || null
            }
          }));
        } else {
          // Otherwise fetch them
          const result = await fetchSyncErrors(event.syncId, { pageSize: 20 });
          setErrors(result.errors || []);
          setNextPageToken(result.nextPageToken || null);
          
          // Cache them
          setErrorsCache(prev => ({
            ...prev,
            [event.syncId]: {
              errors: result.errors || [],
              nextPageToken: result.nextPageToken || null
            }
          }));
        }
      } catch (err) {
        console.error("Error loading errors:", err);
        setError(`Failed to load errors: ${err.message}`);
      } finally {
        setLoading(false);
        setTriedFetching(true);
      }
    };

    loadErrors();
  }, [event, initialErrors, triedFetching, errorsCache]);

  const loadMoreErrors = async () => {
    if (!nextPageToken || loadingMore || !event || !event.syncId) return;
    
    setLoadingMore(true);
    try {
      const result = await fetchSyncErrors(event.syncId, { 
        pageSize: 20, 
        pageToken: nextPageToken 
      });
      
      const newErrors = [...errors, ...(result.errors || [])];
      setErrors(newErrors);
      setNextPageToken(result.nextPageToken || null);
      
      // Update cache with the new combined errors
      setErrorsCache(prev => ({
        ...prev,
        [event.syncId]: {
          errors: newErrors,
          nextPageToken: result.nextPageToken || null
        }
      }));
    } catch (err) {
      console.error("Error loading more errors:", err);
      alert(`Failed to load more errors: ${err.message}`);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading errors...</span>
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

  if (!errors || errors.length === 0) {
    return <EmptyState message="No errors reported for this sync." />;
  }

  return (
    <div className="space-y-3">
      {errors.map(err => (
        <div key={err.errorId} className="p-3.5 border border-red-300 rounded-lg bg-red-50 text-sm shadow-sm">
          <div className="flex items-start">
              <AlertTriangle size={20} className="mr-3 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-grow">
                  <p className="font-semibold text-red-600">{err.errorType}</p>
                  <p className="text-gray-700 mt-0.5 text-sm leading-snug">{err.errorMessage}</p>
                  <div className="text-xs text-red-500 mt-1.5 opacity-90">
                      <span>Page: {err.pageId || 'N/A'}</span> • <span>Stage: {err.processingStage}</span> 
                      {err.timestamp && <> • <span>Time: {new Date(err.timestamp).toLocaleTimeString()}</span></>}
                  </div>
              </div>
          </div>
          {err.aiSummary && (
            <div className="mt-2.5 pt-2.5 border-t border-red-200 flex items-start">
               <Lightbulb size={16} className="mr-2.5 text-yellow-500 flex-shrink-0 mt-0.5" />
               <div>
                  <p className="text-xs font-semibold text-gray-700 mb-0.5">AI Suggestion:</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{err.aiSummary}</p>
               </div>
            </div>
          )}
        </div>
      ))}
      
      {nextPageToken && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMoreErrors}
            disabled={loadingMore}
            className={`px-4 py-2 flex items-center text-sm rounded-md ${
              loadingMore 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
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
                Load More Errors
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorsTab;