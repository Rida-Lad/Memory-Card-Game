import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DailyChallenge = () => {
  // Unique emoji set for daily challenge (more challenging)
  const emojiSet = ["🌍", "🌎", "🌏", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌚", "🌛", "🌜", "☀️"];
  
  // Generate pairs with unique IDs
  const generateCards = () => {
    const pairs = emojiSet.slice(0, 8); // Use 8 pairs for daily challenge
    return [
      ...pairs.map((emoji, index) => ({ id: index * 2 + 1, value: emoji, visible: true })),
      ...pairs.map((emoji, index) => ({ id: index * 2 + 2, value: emoji, visible: true }))
    ];
  };

  // Get today's seed for consistent daily challenge
  const getDailySeed = () => {
    const today = new Date();
    return `${today.getFullYear()}${today.getMonth()}${today.getDate()}`;
  };

  // Shuffle with daily seed for consistent daily challenge
  const shuffleCards = (cards) => {
    const seed = getDailySeed();
    const shuffled = [...cards];
    let random = () => {
      const x = Math.sin(seed + shuffled.length) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);

  // Initialize game
  useEffect(() => {
    const initialCards = shuffleCards(generateCards());
    setCards(initialCards);
    setFlippedCards([]);
    setMoves(0);
    setGameOver(false);
    setTimer(0);

    // Start timer
    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Check for game completion
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => !card.visible)) {
      setGameOver(true);
    }
  }, [cards]);

  const handleCardClick = (id) => {
    if (flippedCards.length === 2 || gameOver) return;

    const clickedCard = cards.find(card => card.id === id && card.visible);
    if (!clickedCard || flippedCards.some(c => c.id === id)) return;

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);
    setMoves(prev => prev + 1);

    if (newFlipped.length === 2) {
      setTimeout(() => {
        const isMatch = newFlipped[0].value === newFlipped[1].value;
        if (isMatch) {
          setCards(cards.map(card =>
            card.id === newFlipped[0].id || card.id === newFlipped[1].id
              ? { ...card, visible: false }
              : card
          ));
        }
        setFlippedCards([]);
      }, 500);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ fontFamily: 'Atma' }} className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Main game container */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-900 bg-opacity-80 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md border border-gray-700 border-opacity-50">
          {/* Header with challenge info */}
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 animate-gradient-x">
              Daily Challenge
            </h1>
            <div className="w-8"></div> {/* Spacer for alignment */}
          </div>

          {/* Stats bar */}
          <div className="flex justify-between mb-6">
            <div className="bg-blue-900 bg-opacity-70 px-4 py-2 rounded-full">
              ⏱️ Time: {formatTime(timer)}
            </div>
            <div className="bg-blue-900 bg-opacity-70 px-4 py-2 rounded-full">
              🏃 Moves: {moves}
            </div>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {cards.map((card) => (
              <button
                key={card.id}
                className={`
                  aspect-square flex items-center justify-center text-3xl 
                  rounded-xl transition-all duration-300 relative overflow-hidden
                  ${!card.visible ? "invisible" :
                    flippedCards.some(c => c.id === card.id) ?
                      "bg-blue-300 text-black shadow-lg shadow-blue-300/50 scale-105" :
                      "bg-blue-900 text-white hover:bg-blue-800 border-2 border-blue-700 hover:border-blue-500"
                  }
                  ${!card.visible ? "" : "shadow-lg"}
                  transform hover:scale-105 active:scale-95
                `}
                onClick={() => card.visible && handleCardClick(card.id)}
                disabled={!card.visible || flippedCards.length === 2}
              >
                {!card.visible ? "" :
                  flippedCards.some(c => c.id === card.id) ? (
                    <>
                      <span className="relative z-10 drop-shadow-md">{card.value}</span>
                      <div className="absolute inset-0 bg-white opacity-20 rounded-xl"></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 opacity-80 rounded-xl"></div>
                  )
                }
              </button>
            ))}
          </div>

          {/* Game over modal */}
          {gameOver && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-20">
              <div className="bg-gradient-to-br from-blue-900 to-gray-900 p-6 rounded-xl max-w-sm w-full border-2 border-blue-500 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                  � Challenge Complete!
                </h2>
                <div className="text-center mb-6">
                  <p className="text-blue-200">Your Results:</p>
                  <div className="flex justify-center gap-8 mt-4">
                    <div className="text-xl font-bold text-blue-100">Time: {formatTime(timer)}</div>
                    <div className="text-xl font-bold text-cyan-100">Moves: {moves}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link 
                    to="/daily" 
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-full text-white font-bold transition-all hover:shadow-lg hover:shadow-blue-500/30 text-center"
                  >
                    Play Again
                  </Link>
                  <Link 
                    to="/" 
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white font-bold transition-all text-center"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;