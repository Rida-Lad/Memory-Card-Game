import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VsBot from './VsBot';
import MemoryCardAdventure from './AdventureMode';
import DailyChallenge from './DailyChallenge';

function App() {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 600; i++) {
        const size = Math.random() * 3 + 1;
        const colorChoice = Math.random() > 0.2 ? 'bg-purple-400' : 'bg-pink-400';
        const style = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          opacity: Math.random() * 0.7 + 0.3,
          animationDuration: `${Math.random() * 15 + 10}s`,
          animationDelay: `${Math.random() * 15}s`,
          borderRadius: '50%'
        };
        newStars.push(
          <div 
            key={i} 
            className={`absolute ${colorChoice} animate-float`}
            style={style}
          />
        );
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white overflow-hidden relative" style={{ fontFamily: "'Atma', cursive" }}>
        {/* Space background */}
        <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none bg-gray-900/80">
          {stars}
          <style jsx global>{`
            @font-face {
              font-family: 'Atma';
              font-style: normal;
              font-weight: 400;
              src: url(https://fonts.gstatic.com/s/atma/v5/uK_z4rqWc-Eoo8JzKjc9PvdR.woff2) format('woff2');
            }
            @keyframes float {
              0% { transform: translate(0, 0) rotate(0deg); }
              25% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 100 - 50}px); }
              50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 200 - 100}px); opacity: ${Math.random() * 0.5 + 0.5}; }
              75% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 100 - 50}px); }
              100% { transform: translate(0, 0) rotate(0deg); }
            }
            .animate-float {
              animation: float linear infinite;
              will-change: transform, opacity;
            }
            .radial-title {
              background: radial-gradient(circle at center, #7e22ce 0%, #a855f7 40%, #ec4899 80%, #d946ef 100%);
              -webkit-background-clip: text;
              background-clip: text;
            }
            .radial-button {
              background: radial-gradient(circle at 75% 25%, #7e22ce 0%, #a855f7 50%, #ec4899 100%);
            }
          `}</style>
        </div>
        
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center min-h-screen gap-10 p-6 relative z-10">
              {/* Radial Gradient Title */}
              <div className="text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-2 tracking-wider 
                              radial-title text-transparent
                              drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
                  MEMORY CARD GAME
                </h1>
                <h2 className="text-xl md:text-2xl font-medium 
                              bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent
                              animate-gradient-text">
                  by RIDA LADIB
                </h2>
                <style jsx>{`
                  @keyframes gradient-text {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                  }
                  .animate-gradient-text {
                    animation: gradient-text 3s ease infinite;
                    background-size: 200% 200%;
                  }
                `}</style>
              </div>
              
              {/* Radial Gradient Buttons with Gray-900 Base */}
              <div className="flex flex-col gap-5 w-full max-w-md">
                <GameModeButton 
                  to="/adventure" 
                  title="Adventure" 
                />
                <GameModeButton 
                  to="/vsbot" 
                  title="VS Bot" 
                />
                <GameModeButton 
                  to="/daily" 
                  title="Daily Challenge" 
                />
              </div>
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

// Radial Gradient Button Component with Gray-900
const GameModeButton = ({ to, title }) => (
  <Link 
    to={to}
    className={`relative p-5 text-center text-white font-bold text-xl tracking-wider
              transition-all duration-300 hover:scale-105 rounded-full
              shadow-lg hover:shadow-purple-500/50 overflow-hidden
              border border-gray-700
              bg-gray-900/80 backdrop-blur-sm
              radial-button`}
  >
    <span className="relative z-10 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{title}</span>
    <div className="absolute inset-0 bg-white/0 hover:bg-white/5 transition-all duration-300 rounded-full" />
  </Link>
);

export default App;