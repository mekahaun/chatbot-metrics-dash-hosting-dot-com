"use client";

import { Wrench } from "lucide-react";

const SystemControl = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full">
          <Wrench className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-700">Working on it</h2>
        <p className="text-gray-500 max-w-md">
          System control features are currently under development. Check back soon!
        </p>
      </div>
    </div>
  );
};

export default SystemControl;