import React from 'react';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.03] border border-white/[0.05] ${className}`}
      {...props}
    />
  );
};

export const BookingSkeleton = () => (
  <div className="bg-gray-900 rounded-[2.5rem] p-6 border border-gray-800 flex flex-col h-[320px] relative overflow-hidden">
    <div className="flex justify-between items-start mb-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-xl" />
          <Skeleton className="h-5 w-32 rounded-lg" />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-4 w-8 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="w-8 h-8 rounded-xl" />
    </div>

    <div className="flex-1 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
      <Skeleton className="h-12 rounded-2xl w-full" />
    </div>

    <div className="mt-6 flex gap-2">
      <Skeleton className="h-12 rounded-[1.2rem] flex-1" />
      <Skeleton className="h-12 rounded-[1.2rem] flex-1" />
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="bg-gray-900 p-5 rounded-2xl h-32 border border-gray-800 relative overflow-hidden">
    <Skeleton className="h-3 w-20 mb-3" />
    <Skeleton className="h-8 w-32 mb-4" />
    <Skeleton className="h-3 w-24" />
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-5">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const GallerySkeleton = () => (
  <div className="bg-gray-900 rounded-3xl p-4 border border-gray-800 animate-pulse">
    <Skeleton className="w-full aspect-video rounded-2xl mb-4" />
    <div className="flex justify-between items-center px-1">
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-4 w-12 rounded" />
    </div>
  </div>
);

export const LeadSkeleton = () => (
  <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 animate-pulse flex flex-col md:flex-row justify-between items-center gap-6">
    <div className="flex gap-4 items-center flex-1">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-3 w-32 rounded" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24 rounded-lg" />
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
  </div>
);

export const RoadmapSkeleton = () => (
  <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-5 border border-gray-800/50 animate-pulse">
    <Skeleton className="w-4 h-6 rounded" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-48 rounded" />
      <Skeleton className="h-3 w-32 rounded" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
  </div>
);
