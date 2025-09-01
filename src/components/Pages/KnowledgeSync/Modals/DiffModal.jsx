"use client";

import { Loader, X } from "lucide-react";
import React from 'react';

const DiffModal = ({ oldContent, newContent, pageIdOld, pageIdNew, titleOld, titleNew, onClose, isLoading = false }) => { 
  // Stop propagation on modal content clicks
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div 
        className="modal-content bg-white rounded-lg shadow-xl max-w-6xl w-full overflow-hidden"
        onClick={handleModalContentClick}
      >
        {/* Header with title and close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Content Difference Viewer</h3>
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
        <div className="p-1 sm:p-2 md:p-3 max-h-[80vh]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 w-full">
              <Loader size={36} className="animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading difference view...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="flex flex-col h-[70vh]">
                <h4 className="font-semibold mb-1 text-sm text-center text-gray-700 p-1.5 bg-gray-100 rounded-t-md">Previous: {titleOld} ({pageIdOld})</h4>
                <iframe srcDoc={oldContent} title="Old Content" className="w-full flex-grow border border-gray-300 rounded-b-md bg-white"/>
              </div>
              <div className="flex flex-col h-[70vh]">
                <h4 className="font-semibold mb-1 text-sm text-center text-gray-700 p-1.5 bg-gray-100 rounded-t-md">New: {titleNew} ({pageIdNew})</h4>
                <iframe srcDoc={newContent} title="New Content" className="w-full flex-grow border border-gray-300 rounded-b-md bg-white"/>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiffModal;