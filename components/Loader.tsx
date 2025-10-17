
import React from 'react';

interface LoaderProps {
  topic: string;
}

const Loader: React.FC<LoaderProps> = ({ topic }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
      <h2 className="text-2xl font-semibold text-gray-200 mt-6">Generating Quiz...</h2>
      <p className="text-gray-400 mt-2">Searching the web for the latest on "{topic}"</p>
    </div>
  );
};

export default Loader;
