import React from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

export default function TooltipComponent({ text, anchorSelect }) {
  return (
    <Tooltip anchorSelect={anchorSelect} place="top" className="z-[999999999]">
      {text}
    </Tooltip>
    // <div className="inline-block">
    //   <div className="absolute top-0 -translate-y-full right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
    //     <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 max-w-xs">
    //       {text}
    //     </div>
    //   </div>
    //   <div className="inline-block">
    //     {icon}
    //   </div>
    // </div>
  );
}
