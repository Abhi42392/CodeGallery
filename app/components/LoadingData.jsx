import React from 'react';

const LoadingData = () => {

  return (
    <div className="flex flex-col duration-300 rounded-2xl overflow-hidden">
        <div className={`w-full h-64 bg-gray-300 animate-pulse rounded-2xl`}></div>
    </div>
  );
};

export default LoadingData;