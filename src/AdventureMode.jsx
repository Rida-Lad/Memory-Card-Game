import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy } from 'lucide-react';

const MemoryCardAdventure = () => {
  // Game Configuration
  const emojiSets = [
    ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🥝', '🍍'],
    ['🍅', '🥑', '🥦', '🥒', '🌽', '🥕', '🌶️', '🥗', '🥬', '🥜', '🍆', '🥔'],
    ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮'],
    ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🥊'],
    ['🚀', '🛰️', '🌍', '🌎', '🌏', '🌐', '🛸', '🌙', '☄️', '✨', '🌠', '🌌']
  ];

  const levelConfigs = [
    { level: 1, cardPairs: 4, difficulty: 'Easy', requiredMatches: 4 },
    { level: 2, cardPairs: 6, difficulty: 'Medium', requiredMatches: 6 },
    { level: 3, cardPairs: 8, difficulty: 'Hard', requiredMatches: 8 },
    { level: 4, cardPairs: 10, difficulty: 'Expert', requiredMatches: 10 },
    { level: 5, cardPairs: 12, difficulty: 'Master', requiredMatches: 12 }
  ];

  // Game State Management
  const loadGameState = () => {
    const savedData = localStorage.getItem('memoryCardProgress');
    return savedData ? JSON.parse(savedData) : { currentLevel: 1, levelsCompleted: [] };
  };

  const [gameState, setGameState] = useState({
    ...loadGameState(),
    cards: [],
    selectedCards: [],
    matchedPairs: 0,
    isInitialized: false
  });

  const [isLandscape, setIsLandscape] = useState(false);

  // Initialize Game
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    setGameState(prev => ({ ...prev, isInitialized: true }));

    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Initialize Level
  const initializeLevel = (level) => {
    const config = levelConfigs.find(l => l.level === level);
    if (!config) return;

    const emojis = emojiSets[level - 1];
    const newCards = [];
    
    const pairsToCreate = level === 5 ? emojis.length : config.cardPairs;
    
    for (let i = 0; i < pairsToCreate; i++) {
      const emoji = emojis[i];
      newCards.push(
        { id: `${emoji}-1`, value: emoji, matched: false },
        { id: `${emoji}-2`, value: emoji, matched: false }
      );
    }

    const shuffledCards = newCards
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, order: index }));

    setGameState(prev => ({
      ...prev,
      cards: shuffledCards,
      selectedCards: [],
      matchedPairs: 0
    }));
  };

  useEffect(() => {
    if (gameState.isInitialized) {
      initializeLevel(gameState.currentLevel);
    }
  }, [gameState.currentLevel, gameState.isInitialized]);

  // Save Progress
  useEffect(() => {
    if (gameState.isInitialized) {
      localStorage.setItem('memoryCardProgress', JSON.stringify({
        currentLevel: gameState.currentLevel,
        levelsCompleted: gameState.levelsCompleted
      }));
    }
  }, [gameState.currentLevel, gameState.levelsCompleted, gameState.isInitialized]);

  // Game Logic
  const handleCardSelect = (card) => {
    if (gameState.selectedCards.length === 2 || card.matched) return;
    if (window.navigator.vibrate) window.navigator.vibrate(10);

    const newSelectedCards = [...gameState.selectedCards, card];
    setGameState(prev => ({ ...prev, selectedCards: newSelectedCards }));

    if (newSelectedCards.length === 2) {
      setTimeout(() => checkMatch(newSelectedCards), 1000);
    }
  };

  const checkMatch = (selected) => {
    const [first, second] = selected;
    let newState = { selectedCards: [] };

    if (first.value === second.value) {
      const updatedCards = gameState.cards.map(card => 
        card.value === first.value ? { ...card, matched: true } : card
      );
      
      const newMatchedPairs = gameState.matchedPairs + 1;
      const currentConfig = levelConfigs.find(l => l.level === gameState.currentLevel);
      
      newState = {
        ...newState,
        cards: updatedCards,
        matchedPairs: newMatchedPairs
      };

      if (newMatchedPairs === currentConfig.requiredMatches) {
        const newCompletedLevels = [...new Set([...gameState.levelsCompleted, gameState.currentLevel])];
        newState.levelsCompleted = newCompletedLevels;

        if (gameState.currentLevel < 5) {
          setTimeout(() => {
            setGameState(prev => ({
              ...prev,
              currentLevel: prev.currentLevel + 1
            }));
          }, 1500);
        }
      }
    }

    setGameState(prev => ({ ...prev, ...newState }));
  };

  const resetLevel = () => {
    initializeLevel(gameState.currentLevel);
  };

  const resetProgress = () => {
    localStorage.removeItem('memoryCardProgress');
    setGameState({
      currentLevel: 1,
      levelsCompleted: [],
      cards: [],
      selectedCards: [],
      matchedPairs: 0,
      isInitialized: true
    });
  };

  // Responsive Helpers
  const getGridColumns = () => {
    const config = levelConfigs.find(l => l.level === gameState.currentLevel);
    if (!config) return 'grid-cols-4';
    
    if (window.innerWidth < 640) {
      if (gameState.currentLevel === 5) return 'grid-cols-6';
      if (config.cardPairs <= 4) return 'grid-cols-4';
      if (config.cardPairs <= 6) return 'grid-cols-3';
      return 'grid-cols-4';
    }
    if (gameState.currentLevel === 5) return 'grid-cols-6';
    if (config.cardPairs <= 4) return 'grid-cols-4';
    if (config.cardPairs <= 6) return 'grid-cols-6';
    return 'grid-cols-8';
  };

  const getCardSize = () => {
    const config = levelConfigs.find(l => l.level === gameState.currentLevel);
    if (!config) return 'text-2xl';
    
    if (window.innerWidth < 640) {
      if (gameState.currentLevel === 5) return 'text-2xl';
      if (config.cardPairs <= 4) return 'text-4xl';
      if (config.cardPairs <= 6) return 'text-3xl';
      return 'text-2xl';
    }
    return 'text-4xl';
  };

  return (
    <div style={{ fontFamily: 'Atma' }} className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Main Game Container */}
      <div className="w-full max-w-4xl mx-auto">
        {isLandscape && window.innerWidth < 640 && (
          <div className="text-yellow-400 text-center mb-4 p-2 bg-black bg-opacity-70 rounded-lg backdrop-blur-sm">
            For best experience, please rotate your device to portrait mode
          </div>
        )}
        
        <div className="bg-gray-900 bg-opacity-80 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md border border-gray-700 border-opacity-50">
          {/* Game Header */}
          <h1 className="text-3xl font-bold text-center mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 animate-gradient-x">
            Adventure Mode
          </h1>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-800 bg-opacity-70 h-8 sm:h-10 rounded-full mb-4 sm:mb-6 overflow-hidden relative">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500 shadow-lg shadow-purple-500/30"
              style={{ width: `${(gameState.currentLevel / 5) * 100}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                Progress: {gameState.currentLevel}/5
              </span>
            </div>
          </div>
          
          {/* Level Info */}
          <div className="text-center mb-4 sm:mb-6 animate-pulse">
            <h2 className="text-xl sm:text-2xl font-semibold text-purple-400 drop-shadow-lg">
              Level {gameState.currentLevel}
            </h2>
            <p className="text-purple-300 text-sm sm:text-base">
              {levelConfigs[gameState.currentLevel - 1]?.difficulty || 'Easy'} Mode
            </p>
          </div>
          
          {/* Card Grid */}
          <div 
            className={`grid ${getGridColumns()} gap-2 sm:gap-4 place-items-center p-1 sm:p-2`}
          >
            {gameState.cards.map(card => (
              <div 
                key={card.id}
                onClick={() => handleCardSelect(card)}
                className={`
                  w-full aspect-square border-2 rounded-lg cursor-pointer transition-all duration-300 
                  flex items-center justify-center ${getCardSize()} sm:text-4xl
                  ${card.matched ? 
                    'bg-purple-800 opacity-50 border-purple-400 shadow-inner shadow-purple-400/30' : 
                    'bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-purple-400'
                  }
                  ${gameState.selectedCards.includes(card) ? 
                    'border-purple-500 shadow-lg shadow-purple-500/50 scale-105' : 
                    'border-gray-700'
                  }
                  ${(gameState.selectedCards.includes(card) || card.matched) ? '' : 'opacity-80 hover:opacity-100'}
                  min-w-[50px] sm:min-w-[60px] transform hover:scale-105 transition-transform
                `}
                style={{
                  minHeight: 'clamp(50px, 12vw, 80px)',
                  touchAction: 'manipulation'
                }}
              >
                {(gameState.selectedCards.includes(card) || card.matched) && (
                  <span className="drop-shadow-lg">{card.value}</span>
                )}
              </div>
            ))}
          </div>
          
          {/* Game Controls */}
          <div className="flex flex-col sm:flex-row justify-center items-center mt-4 sm:mt-6 gap-3 sm:gap-4">
            <button 
              onClick={resetLevel}
              className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-full flex items-center text-sm sm:text-base transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5"
            >
              <RefreshCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Reset Level
            </button>
            
            <button 
              onClick={resetProgress}
              className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm sm:text-base transition-all hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5"
            >
              Reset All Progress
            </button>
            
            {gameState.currentLevel === 5 && gameState.levelsCompleted.includes(5) && (
              <div className="flex items-center text-green-400 text-sm sm:text-base animate-bounce">
                <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
                Adventure Completed!
              </div>
            )}
          </div>
          
          {/* Completed Levels */}
          <div className="mt-4 sm:mt-6 text-center">
            <h3 className="text-lg sm:text-xl text-purple-500 mb-2 drop-shadow-md">Completed Levels</h3>
            <div className="flex justify-center flex-wrap gap-2">
              {levelConfigs.map(level => (
                <div 
                  key={level.level} 
                  className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                    text-sm sm:text-base transition-all duration-300
                    ${gameState.levelsCompleted.includes(level.level) 
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-110' 
                      : 'bg-gray-800 text-gray-500'
                    }
                    hover:scale-110
                  `}
                >
                  {level.level}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles */}
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
    </div>
  );
};

export default MemoryCardAdventure;