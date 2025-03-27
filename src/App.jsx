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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden relative" style={{ fontFamily: "'Atma', cursive" }}>
        {/* Cosmic Radial Background */}
        <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/70 via-gray-900/90 to-gray-900"></div>
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
              background: radial-gradient(circle at center, 
                #7e22ce 0%, 
                #a855f7 30%, 
                #d946ef 60%, 
                #ec4899 80%, 
                #a855f7 100%);
              -webkit-background-clip: text;
              background-clip: text;
              text-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
            }
            .radial-button {
              background: radial-gradient(circle at 75% 25%, 
                #7e22ce 0%, 
                #a855f7 40%, 
                #d946ef 80%);
              box-shadow: 0 4px 20px -5px rgba(126, 34, 206, 0.5),
                          inset 0 1px 1px rgba(255, 255, 255, 0.1);
            }
            .radial-button-hover {
              background: radial-gradient(circle at 75% 25%, 
                #7e22ce 0%, 
                #a855f7 50%, 
                #ec4899 100%);
            }
          `}</style>
        </div>
        
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col items-center justify-center min-h-screen gap-10 p-6 relative z-10">
              {/* Cosmic Radial Title */}
              <div className="text-center">
                <h1 className="text-5xl md:text-7xl font-bold mb-2 tracking-wider 
                              radial-title text-transparent
                              transition-all duration-1000 hover:text-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                  MEMORY CARD GAME
                </h1>
                <h2 className="text-xl md:text-2xl font-medium 
                              bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent
                              animate-gradient-text
                              bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur-sm">
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
              
              {/* Cosmic Radial Buttons */}
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

// Cosmic Radial Button Component
const GameModeButton = ({ to, title }) => (
  <Link 
    to={to}
    className={`relative p-5 text-center text-white font-bold text-xl tracking-wider
              transition-all duration-500 hover:scale-105 rounded-full
              overflow-hidden border border-gray-700/50
              radial-button hover:radial-button-hover
              group`}
  >
    <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] 
                    group-hover:drop-shadow-[0_2px_8px_rgba(168,85,247,0.6)]">
      {title}
    </span>
    <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/5 to-white/0 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
    <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm rounded-full" />
  </Link>
);

export default App;