"use client";

import { formatDuration, formatTimestamp, getStatusStyles } from "@/utils"; // Adjust path
import {
  AlertOctagon,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch,
  Hourglass,
  Info,
  Layers,
  RefreshCw,
  ToggleLeft,
  XCircle,
} from "lucide-react";

const DetailItemSimple = ({ label, value, badgeColor, textColor, icon }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1.5 border-b border-gray-100 last:border-b-0">
    <dt className="font-medium text-gray-500 flex items-center mb-0.5 sm:mb-0">
      {icon && <span className="mr-2 opacity-80">{icon}</span>}
      {label}:
    </dt>
    <dd
      className={`sm:ml-2 text-gray-800 ${
        textColor ? textColor : ""
      } text-left sm:text-right`}
    >
      {badgeColor ? (
        <span className={`px-2 py-0.5 text-xs rounded-full ${badgeColor}`}>
          {value}
        </span>
      ) : (
        value
      )}
    </dd>
  </div>
);

const OverviewTab = ({ event }) => {
  if (!event) return <p>Loading overview...</p>; // Basic loading state
  const statusStyle = getStatusStyles(event.status);
  // Check if statusStyle.icon is valid before trying to access its 'type' property
  const IconComponent =
    statusStyle.icon && statusStyle.icon.type ? statusStyle.icon.type : Info; // Fallback to Info icon

  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        <DetailItemSimple
          label="Status"
          value={event.status}
          badgeColor={statusStyle.badgeColor}
          icon={
            statusStyle.icon && statusStyle.icon.type ? (
              <IconComponent
                className={`h-4 w-4 mr-1.5 ${statusStyle.iconColor}`}
              />
            ) : (
              <Info className="h-4 w-4 mr-1.5 text-gray-400" />
            )
          }
        />
        <DetailItemSimple
          label="Trigger Type"
          value={event.triggerType}
          icon={<ToggleLeft size={16} className="mr-1.5 text-gray-400" />}
        />
        <DetailItemSimple
          label="Start Time"
          value={formatTimestamp(event.startTime)}
          icon={<Calendar size={16} className="mr-1.5 text-gray-400" />}
        />
        <DetailItemSimple
          label="End Time"
          value={formatTimestamp(event.endTime)}
          icon={<Clock size={16} className="mr-1.5 text-gray-400" />}
        />
        <DetailItemSimple
          label="Duration"
          value={formatDuration(event.startTime, event.endTime)}
          icon={<Hourglass size={16} className="mr-1.5 text-gray-400" />}
        />
        <DetailItemSimple
          label="Documents Processed"
          value={event.counts.documentsProcessed}
          icon={<Layers size={16} className="mr-1.5 text-gray-400" />}
        />
        <DetailItemSimple
          label="Pages Created"
          value={event.counts.pagesCreated}
          icon={<CheckCircle size={16} className="mr-1.5 text-green-500" />}
        />
        <DetailItemSimple
          label="Pages Updated"
          value={event.counts.pagesUpdated}
          icon={<RefreshCw size={16} className="mr-1.5 text-blue-500" />}
        />
        <DetailItemSimple
          label="Pages Deleted"
          value={event.counts.pagesDeleted}
          icon={<XCircle size={16} className="mr-1.5 text-red-500" />}
        />
        <DetailItemSimple
          label="Version Conflicts"
          value={event.counts.versionConflicts}
          icon={<GitBranch size={16} className="mr-1.5 text-yellow-500" />}
        />
        <DetailItemSimple
          label="Errors Encountered"
          value={event.counts.errors}
          textColor={event.counts.errors > 0 ? "text-red-600" : ""}
          icon={
            <AlertOctagon
              size={16}
              className={`mr-1.5 ${
                event.counts.errors > 0 ? "text-red-500" : "text-gray-400"
              }`}
            />
          }
        />
      </dl>
      {event.s3ManifestPath && (
        <a
          href={event.s3ManifestPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm pt-2"
        >
          <ExternalLink size={14} className="mr-1.5" /> View S3 Sync Manifest
        </a>
      )}
    </div>
  );
};

export default OverviewTab;
