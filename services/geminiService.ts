import { GoogleGenAI, Type } from '@google/genai';
import type { QuizQuestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJson = (text: string): string => {
  // First, remove markdown fences if they exist.
  let processedText = text.trim();
  if (processedText.startsWith('```json')) {
    processedText = processedText.slice(7, -3).trim();
  } else if (processedText.startsWith('```')) {
     processedText = processedText.slice(3, -3).trim();
  }

  // Then, find the first '{' and the last '}' to extract the JSON object.
  // This helps strip any leading/trailing text the model might have added.
  const firstBraceIndex = processedText.indexOf('{');
  const lastBraceIndex = processedText.lastIndexOf('}');

  if (firstBraceIndex !== -1 && lastBraceIndex > firstBraceIndex) {
    return processedText.substring(firstBraceIndex, lastBraceIndex + 1);
  }

  // If no JSON object is found, return the processed text and let it fail parsing,
  // which helps in debugging.
  return processedText;
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64String = result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};


export const generateQuiz = async (source: string | File, numQuestions: number): Promise<QuizQuestion[]> => {
  try {
    const model = 'gemini-2.5-flash';
    let contents: any;
    let config: any = {};

    if (source instanceof File) {
        if (source.type !== 'application/pdf') {
            throw new Error("Invalid file type. Please upload a PDF.");
        }
        const base64Data = await fileToBase64(source);
        
        const filePart = { inlineData: { mimeType: source.type, data: base64Data } };
        const textPart = {
            text: `You are an expert quiz creator. Based on the content of the attached file, generate a challenging ${numQuestions}-question multiple-choice quiz.
            Your response MUST be a single JSON object. The JSON object must have a single key "quiz" which is an array of ${numQuestions} question objects.
            Each question object must have the keys: "question", "options" (an array of 4 strings), "correctAnswer", and "explanation".
            The "sources" key for each question must be an empty array [].
            Do not wrap the JSON in markdown backticks or any other text.`
        };
        contents = { parts: [filePart, textPart] };
        config.responseMimeType = 'application/json';
        config.responseSchema = {
            type: Type.OBJECT,
            properties: {
                quiz: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                            sources: { type: Type.ARRAY }
                        },
                         required: ["question", "options", "correctAnswer", "explanation", "sources"]
                    }
                }
            }
        };

    } else { // It's a string (topic)
        contents = `You are an expert quiz creator for students. Your goal is to generate engaging quizzes from credible, up-to-the-minute information.
        Based on the absolute latest news, official press releases, and verified authentic information from the web about "${source}", generate a challenging ${numQuestions}-question multiple-choice quiz.
        Your response MUST be a single JSON object. The JSON object must have a single key "quiz" which is an array of ${numQuestions} question objects.
        Each question object must have the following keys:
        - "question": (string) The quiz question.
        - "options": (array of 4 strings) The multiple-choice options.
        - "correctAnswer": (string) The correct answer, which must be one of the strings from the "options" array.
        - "explanation": (string) A clear and concise explanation for why the correct answer is right.
        - "sources": (array of objects) An array of 1-2 source objects used for the explanation. Each object must have "title" (string) and "uri" (string) keys, linking to the source article.
        
        Do not wrap the JSON in markdown backticks or any other text.`;
        config.tools = [{ googleSearch: {} }];
    }
    
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: config,
    });

    const jsonText = cleanJson(response.text);
    let parsed;
    try {
        parsed = JSON.parse(jsonText);
    } catch(e) {
        console.error("Failed to parse JSON:", jsonText);
        throw new Error("The AI returned a response in an unexpected format. Please try a different topic.");
    }
    
    if (parsed && Array.isArray(parsed.quiz) && parsed.quiz.length > 0) {
      return parsed.quiz as QuizQuestion[];
    } else {
      console.error('Parsed JSON does not match expected quiz structure:', parsed);
      throw new Error("The generated quiz data was invalid or empty. Please try again.");
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    if (error instanceof Error && error.message.includes("unexpected format")) {
        throw error;
    }
    throw new Error('An error occurred while communicating with the AI. Check your connection or try a different topic.');
  }
};


export const getTrendingTopics = async (): Promise<string[] | null> => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `List 5 current hot trending topics that would be interesting for students to take a quiz on, focusing on areas like science, technology, world events, or significant cultural moments. Return your response as a single JSON object with a key "topics" which is an array of 5 strings. Do not add any other text or markdown.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topics: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonText = cleanJson(response.text);
        const parsed = JSON.parse(jsonText);

        if (parsed && Array.isArray(parsed.topics)) {
            return parsed.topics;
        } else {
            console.error('Parsed JSON does not match expected topics structure:', parsed);
            return null;
        }

    } catch (error) {
        console.error('Error fetching trending topics:', error);
        return null;
    }
}