"use client";

import { Loader, X } from "lucide-react";
import React, { useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const ContentViewModal = ({ title, content, type, pageId, onClose, isLoading = false }) => { 
  const contentAreaRef = useRef(null);
  
  useEffect(() => { 
    if (contentAreaRef.current) contentAreaRef.current.scrollTop = 0;
  }, [content, title, pageId]);

  let displayContent = content;

  // Stop propagation on modal content clicks
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div 
        className="modal-content bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden"
        onClick={handleModalContentClick}
      >
        {/* Header with title and close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {pageId && <p className="text-sm text-gray-500">Page ID: {pageId}</p>}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content area */}
        <div ref={contentAreaRef} className="p-6 flex-grow overflow-y-auto relative max-h-[65vh]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader size={36} className="animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading content...</span>
            </div>
          ) : (
            <>
              {type === 'HTML' && <iframe srcDoc={displayContent || "No HTML content available."} title={title} className="w-full h-[65vh] border border-gray-300 rounded-md bg-white"/>}
              {type === 'TXT' && <pre className="text-sm whitespace-pre-wrap break-all bg-gray-50 p-4 rounded-md border border-gray-200">{displayContent || "No text content."}</pre>}
              {type === 'JSON' && displayContent && 
                <SyntaxHighlighter 
                  language="json" 
                  style={materialDark} 
                  customStyle={{ maxHeight: '65vh', overflowY: 'auto', borderRadius:'6px', fontSize: '0.8rem', margin: 0 }} 
                  wrapLines={true} 
                  lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
                  className="shadow-sm"
                >
                  {typeof displayContent === 'string' ? displayContent : JSON.stringify(displayContent, null, 2)}
                </SyntaxHighlighter>
              }
              {type === 'JSON' && !displayContent && <pre className="text-sm">No JSON content.</pre>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentViewModal;