import React from 'react';

interface SkeletonLoaderProps {
  type: 'article' | 'category' | 'hero' | 'page';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => {
  const renderArticleSkeleton = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-2/3 mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        <div className="h-3 bg-gray-300 rounded w-1/6"></div>
      </div>
    </div>
  );

  const renderCategorySkeleton = () => (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/3"></div>
    </div>
  );

  const renderHeroSkeleton = () => (
    <div className="text-center animate-pulse">
      <div className="h-12 bg-gray-300 rounded w-3/4 mx-auto mb-6"></div>
      <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto mb-8"></div>
      <div className="flex justify-center gap-4">
        <div className="h-12 bg-gray-300 rounded w-32"></div>
        <div className="h-12 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
  );

  if (type === 'hero') {
    return renderHeroSkeleton();
  }

  if (type === 'page') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {type === 'article' && renderArticleSkeleton()}
          {type === 'category' && renderCategorySkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;