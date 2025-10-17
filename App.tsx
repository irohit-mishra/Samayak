import React, { useState, useCallback } from 'react';
import { generateQuiz } from './services/geminiService';
import type { QuizQuestion } from './types';
import TopicInput from './components/TopicInput';
import QuizView from './components/QuizView';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');

  const handleStartQuiz = useCallback(async (source: string | File, numQuestions: number) => {
    const topicName = typeof source === 'string' ? source : source.name;

    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setTopic(topicName);

    try {
      const quizData = await generateQuiz(source, numQuestions);
      if (quizData && quizData.length > 0) {
        setQuiz(quizData);
      } else {
        setError('Could not generate a quiz for this topic. Please try another one.');
      }
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRestart = () => {
    setQuiz(null);
    setError(null);
    setTopic('');
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-sans p-4 overflow-hidden">
      <div className="w-full max-w-md md:max-w-4xl mx-auto text-center">
        {!quiz && !isLoading && (
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Samayak
          </h1>
        )}
        {isLoading && <Loader topic={topic} />}
        {error && !isLoading && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative animate-fade-in" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={handleRestart}
              className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        )}
        {!isLoading && !error && !quiz && (
          <TopicInput onStartQuiz={handleStartQuiz} />
        )}
        {!isLoading && !error && quiz && (
          <QuizView quiz={quiz} onRestart={handleRestart} topic={topic} />
        )}
      </div>
    </main>
  );
};

export default App;