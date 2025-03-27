import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DailyChallenge = () => {
  // Theme configuration
  const theme = {
    background: 'bg-gray-900',
    cardBg: 'bg-gray-800',
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    accent: 'bg-pink-500',
    accentHover: 'hover:bg-pink-600',
    text: 'text-gray-100',
    border: 'border-gray-700'
  };

  // Emoji sets for 3-day rotation
  const EMOJI_SETS = [
    ["🌍", "🌎", "🌏", "🌕", "🌖", "🌗", "🌘", "🌑"], // Day 1
    ["🌒", "🌓", "🌔", "🌙", "🌚", "🌛", "🌜", "☀️"], // Day 2
    ["🔥", "💧", "🌪️", "🌊", "⚡", "❄️", "🌋", "🌈"]  // Day 3
  ];

  // Get current day sequence (1-3)
  const getDaySequence = () => {
    const LAST_PLAYED_KEY = 'lastDailyChallengeDay';
    const today = new Date().toDateString();
    const savedData = localStorage.getItem(LAST_PLAYED_KEY);
    
    // First time user or new day
    if (!savedData) {
      const newData = { day: 1, date: today };
      localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(newData));
      return 0; // Index 0 for Day 1
    }

    const { day: lastDay, date: lastDate } = JSON.parse(savedData);
    
    // Same day - return cached day
    if (lastDate === today) {
      return (lastDay - 1) % 3; // Convert to 0-based index
    }
    
    // New day - advance sequence
    const newDay = lastDay % 3 + 1; // 1→2→3→1...
    localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify({
      day: newDay,
      date: today
    }));
    return (newDay - 1) % 3; // Convert to 0-based index
  };

  // Generate cards for current day
  const generateCards = () => {
    const dayIndex = getDaySequence();
    const pairs = EMOJI_SETS[dayIndex];
    return [
      ...pairs.map((emoji, index) => ({ 
        id: index * 2 + 1, 
        value: emoji, 
        visible: true 
      })),
      ...pairs.map((emoji, index) => ({ 
        id: index * 2 + 2, 
        value: emoji, 
        visible: true 
      }))
    ];
  };

  // Shuffle cards using day index as seed
  const shuffleCards = (cards) => {
    const seed = getDaySequence();
    const shuffled = [...cards];
    
    const random = () => {
      const x = Math.sin(seed + shuffled.length) * 10000;
      return x - Math.floor(x);
    };
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Game state
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [nextChallengeTime, setNextChallengeTime] = useState(null);

  // Initialize game
  useEffect(() => {
    const todayKey = `dc-completed-${new Date().toDateString()}`;
    setCompletedToday(localStorage.getItem(todayKey) === 'true');

    // Set next challenge time (next midnight)
    const now = new Date();
    const nextDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    setNextChallengeTime(nextDay.getTime());

    if (!completedToday) {
      setCards(shuffleCards(generateCards()));
      
      const timerInterval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [completedToday]);

  // Check for game completion
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => !card.visible)) {
      setGameOver(true);
      const todayKey = `dc-completed-${new Date().toDateString()}`;
      localStorage.setItem(todayKey, 'true');
      setCompletedToday(true);
    }
  }, [cards]);

  const handleCardClick = (id) => {
    if (flippedCards.length === 2 || gameOver || completedToday) return;

    const clickedCard = cards.find(card => card.id === id && card.visible);
    if (!clickedCard || flippedCards.some(c => c.id === id)) return;

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);
    setMoves(prev => prev + 1);

    if (newFlipped.length === 2) {
      setTimeout(() => {
        if (newFlipped[0].value === newFlipped[1].value) {
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

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Countdown component
  const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState(0);
    
    useEffect(() => {
      if (!nextChallengeTime) return;
      
      const updateCountdown = () => {
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, nextChallengeTime - now));
      };
      
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }, [nextChallengeTime]);
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return (
      <div className="text-center mt-4">
        <p className="text-gray-400 mb-1">Next challenge available in:</p>
        <div className="text-2xl font-mono text-pink-400">
          {String(hours).padStart(2, '0')}:
          {String(minutes).padStart(2, '0')}:
          {String(seconds).padStart(2, '0')}
        </div>
      </div>
    );
  };

  // Get current day number (1-3)
  const getCurrentDay = () => {
    const savedData = localStorage.getItem('lastDailyChallengeDay');
    return savedData ? JSON.parse(savedData).day : 1;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme.background}`}>
      <div className="w-full max-w-md mx-auto">
        <div className={`${theme.cardBg} rounded-xl p-6 shadow-xl border ${theme.border}`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className={`${theme.text} hover:text-pink-400 transition-colors`}>
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Daily Challenge
            </h1>
            <div className="w-8"></div>
          </div>

          {/* Day indicator */}
          <div className={`mb-6 text-center py-2 rounded-lg ${theme.primary}`}>
            <p className="font-bold text-white">Day {getCurrentDay()} of 3</p>
          </div>

          {completedToday ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-purple-300 mb-2">Challenge Completed!</h2>
              <p className="text-gray-400 mb-4">Come back tomorrow for a new challenge.</p>
              <CountdownTimer />
              <Link 
                to="/" 
                className={`mt-6 inline-block w-full py-3 ${theme.accent} ${theme.accentHover} rounded-lg text-white font-bold transition-all`}
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="flex justify-between mb-6">
                <div className={`${theme.primary} px-4 py-2 rounded-lg`}>
                  ⏱️ {formatTime(timer)}
                </div>
                <div className={`${theme.primary} px-4 py-2 rounded-lg`}>
                  🏃 {moves} moves
                </div>
              </div>

              {/* Card grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    className={`aspect-square flex items-center justify-center text-3xl rounded-lg transition-all duration-300 relative overflow-hidden
                      ${!card.visible ? 'invisible' :
                        flippedCards.some(c => c.id === card.id) ?
                          'bg-pink-400 text-black shadow-lg shadow-pink-400/50 scale-105' :
                          'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                      }
                      ${!card.visible ? '' : 'shadow-md'}
                      transform hover:scale-105 active:scale-95`}
                    onClick={() => handleCardClick(card.id)}
                    disabled={!card.visible || flippedCards.length === 2}
                  >
                    {!card.visible ? null : (
                      flippedCards.some(c => c.id === card.id) ? (
                        <>
                          <span className="relative z-10 drop-shadow-md">{card.value}</span>
                          <div className="absolute inset-0 bg-white opacity-20 rounded-lg"></div>
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg"></div>
                      )
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Game over modal */}
          {gameOver && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-20">
              <div className={`${theme.cardBg} p-6 rounded-xl max-w-sm w-full border-2 border-purple-500 shadow-2xl`}>
                <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
                  Challenge Complete!
                </h2>
                <div className="text-center mb-6">
                  <p className="text-purple-200">Your results:</p>
                  <div className="flex justify-center gap-8 mt-4">
                    <div className="text-xl font-bold text-purple-100">{formatTime(timer)}</div>
                    <div className="text-xl font-bold text-pink-100">{moves} moves</div>
                  </div>
                </div>
                <CountdownTimer />
                <div className="flex flex-col gap-3 mt-4">
                  <Link 
                    to="/" 
                    className={`w-full py-3 ${theme.accent} ${theme.accentHover} rounded-lg text-white font-bold transition-all text-center`}
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