import React from "react";
import Card from "@/components/atoms/Card";

const Loading = ({ type = "default" }) => {
  if (type === "dashboard") {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded shimmer mb-2 w-20"></div>
                  <div className="h-8 bg-gray-200 rounded shimmer w-24"></div>
                  <div className="h-4 bg-gray-200 rounded shimmer mt-2 w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="h-6 bg-gray-200 rounded shimmer mb-4 w-32"></div>
            <div className="h-64 bg-gray-200 rounded shimmer"></div>
          </Card>
          <Card className="p-6">
            <div className="h-6 bg-gray-200 rounded shimmer mb-4 w-32"></div>
            <div className="h-64 bg-gray-200 rounded shimmer"></div>
          </Card>
        </div>
      </div>
    );
  }

  if (type === "transactions") {
    return (
      <div className="space-y-4 animate-fade-in">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg shimmer"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded shimmer mb-2 w-32"></div>
                <div className="h-3 bg-gray-200 rounded shimmer w-24"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded shimmer mb-1 w-20"></div>
                <div className="h-3 bg-gray-200 rounded shimmer w-16"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded shimmer w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded shimmer w-1/2"></div>
              <div className="h-2 bg-gray-200 rounded shimmer w-full"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded shimmer w-16"></div>
                <div className="h-4 bg-gray-200 rounded shimmer w-12"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;