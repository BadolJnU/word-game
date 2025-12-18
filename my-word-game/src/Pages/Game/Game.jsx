import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleGenerativeAI } from "@google/generative-ai";


const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export default function Game() {
    const [searchParams] = useSearchParams();
    const difficulty = searchParams.get('difficulty') || 'easy';
    const navigate = useNavigate();
    const timeRef = useRef(30);
    const intervalRef = useRef(null);

    // Game States
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [gameTime, setGameTime] = useState(25 * 60); // 25 Minutes
    const [wordTime, setWordTime] = useState(30);     // 30 Seconds
    const [isGameOver, setIsGameOver] = useState(false);

    // Submission States
    const [selectedFile, setSelectedFile] = useState(null); // New state for the image
    const [userAnswer, setUserAnswer] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const wordTimerRef = useRef(null);

    // 1. Fetch Words
    // 1. Updated Fetch Words inside Game.jsx
    useEffect(() => {
        const fetchWords = async () => {
            setLoading(true);
            try {
                // 1. Increase 'max' to 300 to get a bigger pool to filter from
                const response = await fetch(`https://api.datamuse.com/words?sp=??????&md=f&max=300`);
                const data = await response.json();

                const getFreq = (item) => {
                    if (!item.tags) return 0;
                    const fTag = item.tags.find(t => t.startsWith('f:'));
                    return fTag ? parseFloat(fTag.split(':')[1]) : 0;
                };

                let filtered = data.filter(w => {
                    const freq = getFreq(w);
                    if (difficulty === 'easy') return freq > 40; // Slightly lowered threshold
                    if (difficulty === 'medium') return freq > 5 && freq <= 40;
                    return freq <= 5;
                });

                // 2. SAFETY CHECK: If we have fewer than 50, take words from the original data
                if (filtered.length < 50) {
                    const extraNeeded = 50 - filtered.length;
                    const extraWords = data.filter(w => !filtered.includes(w)).slice(0, extraNeeded);
                    filtered = [...filtered, ...extraWords];
                }

                const finalWords = filtered.sort(() => 0.5 - Math.random()).slice(0, 50);
                setWords(finalWords.map(w => w.word));

            } catch (error) {
                toast.error("Failed to load words. Using fallback list.");
                // 3. HARD FALLBACK: If API fails, use a local list
                setWords(["Adventure", "Brave", "Crystal", "Dance", "Energy"].concat(Array(45).fill("Practice")));
            } finally {
                setLoading(false);
            }
        };
        fetchWords();
    }, [difficulty]);

    // 2. Timers Logic
    const triggerNextWord = () => {
        setCurrentIndex((prev) => {
            if (prev < words.length - 1) {
                timeRef.current = 30; // Reset the Ref
                setWordTime(30);      // Reset the UI
                return prev + 1;
            } else {
                setIsGameOver(true);
                return prev;
            }
        });
    };

    // 3. The Single-Effect Timer
    useEffect(() => {
        if (loading || isGameOver || words.length === 0) return;

        // Clear any existing intervals first
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            // 1. Update Global Game Clock
            setGameTime((prev) => (prev > 0 ? prev - 1 : 0));

            // 2. Update the Ref (The real logic)
            timeRef.current -= 1;

            // 3. Update the UI
            setWordTime(timeRef.current);

            // 4. Check if we need to switch words
            if (timeRef.current <= 0) {
                triggerNextWord();
            }
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // ONLY restart if loading or game status changes
    }, [loading, isGameOver, words.length]);

    const handleNextWord = () => {
        triggerNextWord();
    };
    // 3. AI Analysis Placeholder (Next Step: Gemini API)
    const submitToAi = async () => {
        console.log("API Key found:", import.meta.env.VITE_GEMINI_API_KEY);
        // 1. Validation: Ensure user provided text OR an image
        if (!userAnswer.trim() && !selectedFile) {
            return toast.error("Please paste your text or upload an image!");
        }

        setIsAnalyzing(true);
        const toastId = toast.loading("Gemini is analyzing your work...");

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            You are an English Language Expert. 
            Target Words to check: ${words.join(", ")}
            User text provided: ${userAnswer}
    
            Instructions:
            1. If an image is provided, extract the handwritten text first.
            2. Evaluate if the target words were used correctly in sentences.
            3. Check grammar and spelling.
            4. Return a JSON object ONLY with this structure:
            {
              "score": number,
              "total": 50,
              "feedback": [{"word": "string", "status": "correct/incorrect", "suggestion": "string"}],
              "overall_comment": "string"
            }
          `;

            let result;

            if (selectedFile) {
                // Handle Image + Text Submission
                const imagePart = await fileToGenerativePart(selectedFile);
                result = await model.generateContent([prompt, imagePart]);
            } else {
                // Handle Text-only Submission
                result = await model.generateContent(prompt);
            }

            const response = await result.response;
            const text = response.text().replace(/```json|```/g, ""); // Clean the JSON response
            const data = JSON.parse(text);

            toast.success("Analysis complete!", { id: toastId });
            navigate('/results', { state: { results: data } });

        } catch (error) {
            console.error("AI Error:", error);
            toast.error("Analysis failed. Check your API key or connection.", { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-indigo-900 flex items-center justify-center text-white text-2xl font-bold">Loading Words...</div>;

    return (
        <div className="min-h-screen bg-indigo-950 text-white p-6 flex flex-col items-center">
          {/* HUD Bar - Always visible */}
          <div className="w-full max-w-5xl flex justify-between items-center mb-10 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-xl font-mono">⏱️ {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</div>
            <div className="text-indigo-400 font-bold uppercase tracking-widest">{difficulty} Level</div>
            <div className="text-xl font-mono">Word: {currentIndex + 1} / 50</div>
          </div>
      
          {!isGameOver ? (
            /* --- 1. ACTIVE GAME STATE --- */
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 w-full">
              <div className="bg-white text-indigo-900 rounded-[3rem] p-20 shadow-2xl text-center w-full max-w-2xl mb-8">
                <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
                  {difficulty} mode
                </span>
                <h1 className="text-7xl font-black mt-6 mb-10 tracking-tighter uppercase italic">
                  {words[currentIndex] || "Loading..."}
                </h1>
                
                <div className="relative w-full bg-gray-100 h-4 rounded-full overflow-hidden border-2 border-gray-50">
                  <div 
                    className={`h-full transition-all duration-1000 ease-linear ${wordTime < 10 ? 'bg-red-500' : 'bg-indigo-600'}`}
                    style={{ width: `${(wordTime / 30) * 100}%` }}
                  />
                </div>
                <p className="mt-4 text-gray-400 font-medium">Next word in {wordTime}s</p>
              </div>
              
              <button 
                onClick={handleNextWord}
                className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-full transition font-semibold text-sm uppercase tracking-widest"
              >
                Skip Word →
              </button>
            </div>
          ) : (
            /* --- 2. SUBMISSION STATE (The missing part) --- */
            <div className="w-full max-w-4xl bg-white text-gray-800 rounded-3xl p-10 shadow-2xl animate-in slide-in-from-bottom duration-700">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Time's Up! 🏁</h2>
                <p className="text-gray-500">The 25-minute challenge is over. Please submit your work for AI evaluation.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Text Input Area */}
                <div className="flex flex-col">
                  <label className="font-bold text-sm mb-2 text-gray-400 uppercase">Paste your 50 sentences</label>
                  <textarea 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full h-80 p-5 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 outline-none transition text-lg resize-none bg-gray-50"
                    placeholder="Paste your text here..."
                  />
                </div>
                
                {/* Image Upload Area */}
                <div className="flex flex-col justify-between">
                  <div>
                    <label className="font-bold text-sm mb-2 text-gray-400 uppercase">Or upload photo</label>
                    <div className="border-4 border-dashed border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-200 transition-colors bg-gray-50/50">
                      <p className="text-gray-400 font-medium">
                        {selectedFile ? `✅ ${selectedFile.name}` : "📸 Click to upload"}
                      </p>
                      <input 
                        type="file" 
                        className="hidden" 
                        id="upload" 
                        accept="image/*" 
                        onChange={(e) => setSelectedFile(e.target.files[0])} 
                      />
                      <label htmlFor="upload" className="mt-4 bg-indigo-100 text-indigo-600 px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-200 transition">
                        {selectedFile ? "Change Image" : "Browse Files"}
                      </label>
                    </div>
                  </div>
      
                  {/* THE SUBMIT BUTTON */}
                  <button 
                    onClick={submitToAi}
                    disabled={isAnalyzing}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-xl shadow-lg hover:bg-indigo-700 transition active:scale-95 disabled:bg-gray-400 mt-6"
                  >
                    {isAnalyzing ? "Gemini is Analyzing..." : "Check My Score"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
}