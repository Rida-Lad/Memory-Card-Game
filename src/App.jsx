import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VsBot from './VsBot';
import MemoryCardAdventure from './AdventureMode';
import DailyChallenge from './DailyChallenge';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        {/* Global text gradient animation only */}
        <style jsx global>{`
          @keyframes animate-gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-x {
            background-size: 200% 200%;
            animation: animate-gradient-x 3s ease infinite;
          }
        `}</style>
        
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
              {/* Game Title */}
              <h1 className="text-5xl md:text-6xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 animate-gradient-x">
                Memory Card Master
              </h1>
              
              {/* Game Modes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                <GameModeCard 
                  to="/adventure" 
                  title="Adventure" 
                  description="Progress through challenging levels"
                  color="from-purple-600 to-pink-600"
                />
                <GameModeCard 
                  to="/vsbot" 
                  title="VS Bot" 
                  description="Test your skills against AI"
                  color="from-blue-600 to-cyan-600"
                />
                <GameModeCard 
                  to="/daily" 
                  title="Daily Challenge" 
                  description="Unique puzzle every day"
                  color="from-green-600 to-teal-600"
                />
              </div>
              
              {/* Footer */}
              <p className="text-gray-400 mt-8 text-center">
                Match all the pairs to win!
              </p>
            </div>
          } />
          
          <Route path="/adventure" element={<MemoryCardAdventure />} />
          <Route path="/vsbot" element={<VsBot />} />
          <Route path="/daily" element={<DailyChallenge />} />
        </Routes>
      </div>
    </Router>
  );
}

// Reusable Game Mode Card Component
const GameModeCard = ({ to, title, description, color }) => (
  <Link 
    to={to}
    className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 flex flex-col items-center text-center gap-3`}
  >
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-gray-200">{description}</p>
    <div className="mt-2 px-4 py-2 bg-black bg-opacity-30 rounded-full text-sm">
      Play Now →
    </div>
  </Link>
);

export default App;