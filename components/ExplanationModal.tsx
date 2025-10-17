import React from 'react';
import type { Source } from '../types';

interface ExplanationModalProps {
  isCorrect: boolean;
  explanation: string;
  sources: Source[];
  onNext: () => void;
}

const ExplanationModal: React.FC<ExplanationModalProps> = ({ isCorrect, explanation, sources, onNext }) => {
  const title = isCorrect ? 'Correct!' : 'Explanation';
  const titleColor = isCorrect ? 'text-green-400' : 'text-yellow-400';
  const borderColor = isCorrect ? 'border-green-500/50' : 'border-yellow-500/50';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border ${borderColor} transform transition-all animate-fade-in-up flex flex-col max-h-[90vh]`}>
        <h3 className={`text-2xl font-bold ${titleColor} mb-4`}>{title}</h3>
        <div className="overflow-y-auto flex-grow text-left">
            <p className="text-gray-300 mb-6">{explanation}</p>
            {sources && sources.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Sources:</h4>
                    <ul className="space-y-2">
                        {sources.map((source, index) => (
                            <li key={index}>
                                <a 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-purple-400 hover:text-purple-300 hover:underline break-words text-sm"
                                >
                                    {source.title || source.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                 </div>
            )}
        </div>
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 duration-300 shadow-lg w-full mt-6 flex-shrink-0"
        >
          Next Question
        </button>
      </div>
    </div>
  );
};

export default ExplanationModal;
