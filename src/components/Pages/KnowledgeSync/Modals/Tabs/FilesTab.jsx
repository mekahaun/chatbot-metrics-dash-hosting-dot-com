"use client";

import { DownloadCloud, ExternalLink, Info } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyState from "@/components/Shared/Common/EmptyState";
import { getFileTypeIcon } from "@/utils";

const FilesTab = ({ event, openContentViewModal }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);
  
  useEffect(() => {
    // For debugging purposes, log what we received
    console.log("FilesTab - event data:", event);
    
    // Prepare debug info
    if (event) {
      const info = {
        hasIntermediateFiles: !!event.intermediateFiles,
        filesCount: event.intermediateFiles?.length || 0,
        syncId: event.syncId,
        someEventProps: Object.keys(event).join(', ')
      };
      setDebugInfo(info);
      console.log("FilesTab - debug info:", info);
    }
  }, [event]);
  
  // If there's no event data at all
  if (!event) {
    return <EmptyState message="Event data not available." />;
  }
  
  // If intermediateFiles is not present or null
  if (!event.intermediateFiles) {
    return (
      <div className="space-y-4">
        <EmptyState message="Intermediate files data not available for this sync." />
        {debugInfo && (
          <div className="p-4 mt-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-start">
              <Info size={20} className="mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-600 mb-1">Debug Information</h4>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
                <p className="mt-2 text-sm text-gray-600">
                  {`The 'intermediateFiles' property is missing from the event data. Check your Lambda function implementation 
                  and ensure the getIntermediateFilesForSyncInternal function is working correctly.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // If intermediateFiles is an empty array
  if (event.intermediateFiles.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState message="No intermediate files recorded for this sync." />
        <div className="p-4 mt-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600">
            {`This sync operation didn't generate any intermediate files, or they weren't captured in the database.`}
          </p>
        </div>
      </div>
    );
  }

  const handleFileOpen = (file, changeGroup) => {
    const fileId = `${changeGroup.changePageId}-${file.name}`;
    
    // Set loading state for this file
    setLoadingStates(prev => ({ ...prev, [fileId]: true }));
    
    // Types that can be viewed in the ContentViewModal
    if (['HTML', 'TXT', 'JSON'].includes(file.type)) {
      openContentViewModal(file.name, changeGroup.changePageId, file.type, file.s3Path);
    } 
    // Types that should open in a new tab
    else if (['PDF'].includes(file.type)) {
      window.open(file.s3Path, '_blank');
    }
    
    // Reset loading state after opening
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [fileId]: false }));
    }, 500);
  };

  return (
    <div className="space-y-4">
      {event.intermediateFiles.map(changeGroup => (
        <div key={changeGroup.changePageId} className="p-3 border border-gray-200 rounded-lg bg-white">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Page: {changeGroup.changePageName} ({changeGroup.changePageId})
          </h4>
          <ul className="space-y-1.5">
            {changeGroup.files.map(file => {
              const fileId = `${changeGroup.changePageId}-${file.name}`;
              const isLoading = loadingStates[fileId];
              
              return (
                <li key={file.name} className="flex items-center justify-between text-sm p-1.5 rounded hover:bg-gray-100">
                  <div className="flex items-center truncate">
                    {getFileTypeIcon(file.type)}
                    <span className="ml-2 text-gray-800 truncate" title={file.name}>{file.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {(file.type === 'HTML' || file.type === 'TXT' || file.type === 'JSON') && (
                      <button 
                        onClick={() => handleFileOpen(file, changeGroup)}
                        disabled={isLoading}
                        className={`text-xs ${isLoading ? 'text-gray-400 cursor-wait' : 'text-blue-600 hover:underline'}`}
                      >
                        {isLoading ? 'Opening...' : 'Open'}
                      </button>
                    )}
                    {file.type === 'PDF' && (
                      <button
                        onClick={() => handleFileOpen(file, changeGroup)}
                        disabled={isLoading}
                        className={`text-xs flex items-center ${isLoading ? 'text-gray-400 cursor-wait' : 'text-blue-600 hover:underline'}`}
                      >
                        <ExternalLink size={12} className="mr-1" />
                        {isLoading ? 'Opening...' : 'Open'}
                      </button>
                    )}
                    <a 
                      href={file.s3Path} 
                      download={file.name} 
                      className="text-xs text-gray-500 hover:underline flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        // Show message about downloading via signed url
                        alert('To download the file, please use the "Open" button and then use your browser\'s save function.');
                      }}
                    >
                      <DownloadCloud size={14} className="mr-1" /> Save
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default FilesTab;