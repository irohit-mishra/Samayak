import React, { useState, useEffect } from 'react';
import { getTrendingTopics } from '../services/geminiService';

interface TopicInputProps {
  onStartQuiz: (source: string | File, numQuestions: number) => void;
}

const TopicInput: React.FC<TopicInputProps> = ({ onStartQuiz }) => {
  const [topic, setTopic] = useState('');
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const numQuestions = 10; // Default number of questions

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      const topics = await getTrendingTopics();
      if (topics) {
        setTrendingTopics(topics);
      }
      setIsLoadingTopics(false);
    };
    fetchTopics();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setTopic(''); // Clear topic when file is selected
    } else {
      setSelectedFile(null);
    }
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
    if (e.target.value) {
      setSelectedFile(null); // Clear file when topic is typed
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onStartQuiz(selectedFile, numQuestions);
    } else if (topic.trim()) {
      onStartQuiz(topic, numQuestions);
    }
  };

  const handleTopicClick = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setSelectedFile(null);
    onStartQuiz(selectedTopic, numQuestions);
  };
  
  const isGenerateDisabled = !topic.trim() && !selectedFile;

  return (
    <div className="animate-fade-in-up mt-8 w-full">
      <p className="text-lg text-gray-300 mb-6">Enter a topic, or upload a PDF to generate a quiz!</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
                 <input
                  type="text"
                  value={topic}
                  onChange={handleTopicChange}
                  placeholder="e.g., 'Latest AI breakthroughs'"
                  className="w-full px-5 py-3 pr-14 rounded-full bg-gray-800 border-2 border-gray-700 focus:border-purple-500 focus:ring focus:ring-purple-500/50 outline-none transition-colors duration-300 text-white placeholder-gray-500"
                  aria-label="Quiz topic"
                />
                <label htmlFor="pdf-upload" className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer group">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </label>
                <input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 duration-300 shadow-lg disabled:opacity-50 disabled:scale-100"
              disabled={isGenerateDisabled}
            >
              Generate
            </button>
        </div>
        {selectedFile && <p className="text-center text-sm text-gray-400 mt-2 animate-fade-in">Selected File: <span className="font-medium text-gray-300">{selectedFile.name}</span></p>}
      </form>
      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-400 mb-3">Or try a trending topic:</h3>
        {isLoadingTopics ? (
          <div className="text-gray-500">Loading topics...</div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center">
            {trendingTopics.map((item, index) => (
              <button
                key={index}
                onClick={() => handleTopicClick(item)}
                className="bg-gray-800/80 border border-gray-700 text-gray-300 px-4 py-2 rounded-full text-sm hover:bg-gray-700 hover:border-purple-500 transition-colors duration-200"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicInput;