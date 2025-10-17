import React, { useEffect } from 'react';
import type { QuizQuestion } from '../types';

interface QuestionCardProps {
  question: QuizQuestion;
  onAnswerSelect: (answer: string) => void;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswerSelect, selectedAnswer, isCorrect }) => {
  
  useEffect(() => {
    // Check if the answer correctness has just been revealed
    if (isCorrect === true) {
      // Haptic for correct answer: a short double pulse
      navigator.vibrate?.([100, 30, 100]);
    } else if (isCorrect === false) {
      // Haptic for incorrect answer: a longer single pulse
      navigator.vibrate?.(200);
    }
  }, [isCorrect]);

  const handleSelect = (option: string) => {
    if (selectedAnswer) return;
    // Haptic for selection tap: a short, light vibration
    navigator.vibrate?.(50);
    onAnswerSelect(option);
  };

  const getButtonClass = (option: string) => {
    if (!selectedAnswer) {
      return 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-purple-500';
    }
    if (option === question.correctAnswer) {
      return 'bg-green-500/80 border-green-400 animate-pulse-correct';
    }
    if (option === selectedAnswer && !isCorrect) {
      return 'bg-red-500/80 border-red-400 animate-shake';
    }
    return 'bg-gray-800 border-gray-700 opacity-50';
  };

  return (
    // Main container: vertical on mobile, horizontal on desktop
    <div className="h-full w-full bg-gray-800/50 backdrop-blur-sm p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row md:gap-6">
      
      {/* Question Section */}
      {/* On mobile: a highlighted, self-sizing box. On desktop: a centered, scrollable, half-width container. */}
      <div className="shrink-0 bg-gray-900/50 rounded-lg p-4 md:bg-transparent md:p-0 md:w-1/2 md:h-full md:flex md:items-center md:justify-center md:overflow-y-auto">
        <h2 className="text-xl md:text-3xl font-bold text-center text-gray-100">
          {question.question}
        </h2>
      </div>

      {/* Options Section */}
      {/* On mobile: grows, scrolls. On desktop: centered 2x2 grid. */}
      <div className="flex-grow mt-4 md:mt-0 md:w-1/2 md:h-full grid grid-cols-1 md:grid-cols-2 gap-4 md:content-center overflow-y-auto">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option)}
            disabled={!!selectedAnswer}
            className={`w-full p-4 rounded-xl border-2 font-semibold transition-all duration-300 flex justify-center text-center text-lg min-h-[70px] md:min-h-[120px] whitespace-normal ${getButtonClass(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;