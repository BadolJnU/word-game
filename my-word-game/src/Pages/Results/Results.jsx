import { useLocation, Link } from 'react-router-dom';

export default function Results() {
  const { state } = useLocation();
  const { results } = state || {};

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-indigo-600 mb-2">{results?.score} / {results?.total}</h1>
          <p className="text-xl text-gray-500 font-bold uppercase tracking-widest">Your Final Score</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">Detailed Feedback</h3>
          {results?.feedback.map((item, index) => (
            <div key={index} className={`p-4 rounded-xl border-l-8 ${item.status === 'correct' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
              <p className="font-bold text-lg uppercase">{item.word}</p>
              <p className="text-gray-700 italic">"{item.suggestion}"</p>
            </div>
          ))}
        </div>

        <Link to="/home" className="block mt-10 text-center bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}