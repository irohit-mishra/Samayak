import React, { useState, useMemo } from 'react';
import type { QuizQuestion } from '../types';
import QuestionCard from './QuestionCard';
import ExplanationModal from './ExplanationModal';

interface QuizViewProps {
  quiz: QuizQuestion[];
  topic: string;
  onRestart: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz, topic, onRestart }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const currentQuestion = useMemo(() => quiz[currentQuestionIndex], [quiz, currentQuestionIndex]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return;

    const correct = answer === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 1);
    }
    
    setTimeout(() => {
        setShowExplanation(true);
    }, 1500);
  };
  
  const goToNextQuestion = () => {
      setShowExplanation(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentQuestionIndex(prev => prev + 1);
  }

  const handleNextFromExplanation = () => {
    goToNextQuestion();
  };
  
  const progressPercentage = ((currentQuestionIndex) / quiz.length) * 100;

  if (currentQuestionIndex >= quiz.length) {
    const percentage = Math.round((score / quiz.length) * 100);
    let feedbackMessage = '';
    if (percentage === 100) feedbackMessage = 'Perfect Score! 🌟';
    else if (percentage >= 80) feedbackMessage = 'Excellent Work!';
    else if (percentage >= 50) feedbackMessage = 'Good Job, Keep Practicing!';
    else feedbackMessage = 'You can do it! Try again!';

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-800 rounded-2xl shadow-2xl animate-fade-in">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">Quiz Complete!</h2>
        <p className="text-xl text-gray-300 mb-2">Topic: <span className="font-semibold text-white">{topic}</span></p>
        <p className="text-5xl font-bold text-white my-4">{score} <span className="text-2xl text-gray-400">/ {quiz.length}</span></p>
        <p className="text-2xl font-semibold text-purple-300 mb-6">{percentage}% Correct</p>
        <p className="text-lg text-gray-200">{feedbackMessage}</p>
        <button
          onClick={onRestart}
          className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 duration-300 shadow-lg"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center animate-fade-in">
       <div className="w-full px-2 mb-4">
         <div className="text-sm text-gray-400 mb-2 flex justify-between">
            <span>Question {currentQuestionIndex + 1} of {quiz.length}</span>
            <span className="font-bold">{topic}</span>
         </div>
         <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
      </div>

      <div className="relative w-full h-[550px] md:h-[450px] overflow-hidden">
        {quiz.map((question, index) => (
          <div
            key={index}
            className="absolute w-full h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(${(index - currentQuestionIndex) * 105}%)` }}
          >
             {Math.abs(index - currentQuestionIndex) < 2 && (
                <QuestionCard
                    question={question}
                    onAnswerSelect={handleAnswerSelect}
                    selectedAnswer={currentQuestionIndex === index ? selectedAnswer : null}
                    isCorrect={currentQuestionIndex === index ? isCorrect : null}
                />
            )}
          </div>
        ))}
      </div>
      
      {showExplanation && isCorrect !== null && (
        <ExplanationModal
          isCorrect={isCorrect}
          explanation={currentQuestion.explanation}
          sources={currentQuestion.sources}
          onNext={handleNextFromExplanation}
        />
      )}
    </div>
  );
};

export default QuizView;