import { useLocation, Link } from 'react-router-dom';

export default function Results() {
  const location = useLocation();
  // This extracts the 'results' object we saw in your console
  const results = location.state?.results;

  // Fallback if someone goes to /results directly without playing
  if (!results) {
    return (
      <div className="min-h-screen bg-indigo-950 text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">No Data Found</h1>
        <Link to="/" className="bg-indigo-600 px-6 py-2 rounded-full">Go Back Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-950 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl text-indigo-900 mt-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-black text-indigo-600 mb-2">
            {results.score} / {results.total}
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Your Final Score</p>
          <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 italic text-indigo-800">
            "{results.overall_comment}"
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold border-b pb-2">Word Analysis</h3>
          {results.feedback?.map((item, index) => (
            <div 
              key={index} 
              className={`p-5 rounded-2xl border-l-8 ${
                item.status === 'correct' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-black text-xl uppercase italic tracking-tighter text-indigo-950">
                  {item.word}
                </span>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                  item.status === 'correct' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {item.suggestion}
              </p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Link 
          to="/" 
          className="block mt-10 text-center bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg active:scale-95"
        >
          Play Again
        </Link>
      </div>
    </div>
  );
}