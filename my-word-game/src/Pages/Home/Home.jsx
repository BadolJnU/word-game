import { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [view, setView] = useState("play"); // 'play' or 'history'
  const navigate = useNavigate();

  // Mock data for the table (Later you will fetch this from Firestore)
  const historyData = [
    { id: 1, date: "2025-12-10", score: "42/50", difficulty: "Medium" },
    { id: 2, date: "2025-12-12", score: "35/50", difficulty: "Hard" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto mt-10 p-4">
        {/* Banner Section */}
        <div className="bg-indigo-700 rounded-3xl p-12 text-center text-white shadow-xl mb-10">
          <h2 className="text-4xl font-extrabold mb-4">Master Your Vocabulary</h2>
          <p className="text-indigo-100 mb-8 text-lg">50 words. 25 minutes. Can you beat the AI?</p>
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setView("play")}
              className={`px-6 py-3 rounded-full font-semibold transition ${view === 'play' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white border border-indigo-400'}`}
            >
              Play Game
            </button>
            <button 
              onClick={() => setView("history")}
              className={`px-6 py-3 rounded-full font-semibold transition ${view === 'history' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white border border-indigo-400'}`}
            >
              View History
            </button>
          </div>
        </div>

        {/* Conditional Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {view === "play" ? (
            <div className="text-center py-10">
              <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
              <p className="text-gray-500 mb-6">Choose your difficulty and begin the challenge.</p>
              <button 
                onClick={() => navigate("/game-setup")}
                className="bg-green-500 text-white px-10 py-4 rounded-xl text-xl font-bold hover:bg-green-600 transform hover:scale-105 transition"
              >
                Start New Game
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-6">Your Recent Scores</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-gray-400 uppercase text-sm">
                    <th className="py-3">Date</th>
                    <th className="py-3">Difficulty</th>
                    <th className="py-3">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-4">{item.date}</td>
                      <td className="py-4 font-medium">{item.difficulty}</td>
                      <td className="py-4 text-indigo-600 font-bold">{item.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}