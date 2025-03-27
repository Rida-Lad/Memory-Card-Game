import React, { useState, useEffect } from "react";

const emojiPairs = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const initialCards = [
  ...emojiPairs.map((emoji, index) => ({ id: index * 2 + 1, value: emoji, visible: true })),
  ...emojiPairs.map((emoji, index) => ({ id: index * 2 + 2, value: emoji, visible: true }))
];

const shuffleCards = (cards) => [...cards].sort(() => Math.random() - 0.5);

function VsBot() {
  const [cards, setCards] = useState(shuffleCards(initialCards));
  const [flippedCards, setFlippedCards] = useState([]);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [botMemory, setBotMemory] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!playerTurn && !gameOver && flippedCards.length === 0) {
      const timer = setTimeout(() => {
        const availableCards = cards.filter(card => card.visible && !flippedCards.some(c => c.id === card.id));

        if (availableCards.length < 2) {
          setPlayerTurn(true);
          return;
        }

        // Consistent medium-difficulty strategy
        let firstChoice, secondChoice;

        // 60% chance to use memory if available
        if (Math.random() < 0.4 && botMemory.length > 0) {
          const memoryMatch = botMemory[Math.floor(Math.random() * botMemory.length)];
          firstChoice = availableCards.find(card => card.value === memoryMatch.value && card.id !== memoryMatch.id)
            || availableCards[Math.floor(Math.random() * availableCards.length)];
        } else {
          firstChoice = availableCards[Math.floor(Math.random() * availableCards.length)];
        }

        // For second choice:
        // - If first choice was from memory, try to match it (70% chance)
        // - Otherwise random (but avoid recently seen mismatches)
        if (botMemory.some(mem => mem.id === firstChoice.id) && Math.random() < 0.7) {
          secondChoice = availableCards.find(card =>
            card.id !== firstChoice.id && card.value === firstChoice.value
          );
        }

        if (!secondChoice) {
          const recentlySeenMismatches = botMemory.filter(mem =>
            mem.value !== firstChoice.value
          );

          // 40% chance to avoid recently seen mismatches
          if (recentlySeenMismatches.length > 0 && Math.random() < 0.4) {
            secondChoice = availableCards.find(card =>
              card.id !== firstChoice.id &&
              !recentlySeenMismatches.some(mem => mem.value === card.value)
            );
          }

          if (!secondChoice) {
            secondChoice = availableCards.find(card => card.id !== firstChoice.id);
          }
        }

        setFlippedCards([firstChoice, secondChoice]);
        setTimeout(() => {
          const isMatch = firstChoice.value === secondChoice.value;
          checkMatch([firstChoice, secondChoice], isMatch);
        }, 500);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [playerTurn, gameOver, flippedCards, cards, botMemory]);

  useEffect(() => {
    if (cards.every(card => !card.visible)) {
      setGameOver(true);
    }
  }, [cards]);

  const handleCardClick = (id) => {
    if (!playerTurn || flippedCards.length === 2 || gameOver) return;

    const clickedCard = cards.find(card => card.id === id && card.visible);
    if (!clickedCard || flippedCards.some(c => c.id === id)) return;

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setTimeout(() => {
        const isMatch = newFlipped[0].value === newFlipped[1].value;
        checkMatch(newFlipped, isMatch);
      }, 200);
    }
  };

  const checkMatch = (selected, isMatch) => {
    const isPlayerTurn = playerTurn;

    if (isMatch) {
      setCards(cards.map(card =>
        card.id === selected[0].id || card.id === selected[1].id
          ? { ...card, visible: false }
          : card
      ));

      if (isPlayerTurn) {
        setPlayerScore(prev => prev + 1);
      } else {
        setBotScore(prev => prev + 1);
        setBotMemory(prev => prev.filter(card =>
          card.id !== selected[0].id && card.id !== selected[1].id
        ));
      }
    } else if (isPlayerTurn) {
      // Only add to bot memory if player failed to match
      setBotMemory(prev => [...prev, ...selected]);
    }

    setTimeout(() => {
      setFlippedCards([]);
      setPlayerTurn(!isPlayerTurn);
    }, isMatch ? 800 : 1000);
  };

  const resetGame = () => {
    setCards(shuffleCards(initialCards.map(card => ({ ...card, visible: true }))));
    setFlippedCards([]);
    setPlayerTurn(true);
    setPlayerScore(0);
    setBotScore(0);
    setBotMemory([]);
    setGameOver(false);
  };

  return (
    <div style={{ fontFamily: 'Atma' }} className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Main game container */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-900 bg-opacity-80 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-md border border-gray-700 border-opacity-50">
          {/* Title with gradient text */}
          <h1 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 animate-gradient-x">
            Animal Memory Match
          </h1>

          {/* Score display */}
          <div className="flex justify-between mb-6">
            <div className={`text-lg px-4 py-2 rounded-full transition-all ${playerTurn ? "bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30" : "bg-gray-800 bg-opacity-70"}`}>
              You: <span className="font-bold">{playerScore}</span>
            </div>
            <div className={`text-lg px-4 py-2 rounded-full transition-all ${!playerTurn ? "bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30" : "bg-gray-800 bg-opacity-70"}`}>
              Bot: <span className="font-bold">{botScore}</span>
            </div>
          </div>

          {/* Turn indicator */}
          <div className="mb-4 text-center">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold transition-all ${playerTurn ? "bg-purple-900 text-purple-100 shadow-lg shadow-purple-500/20 animate-pulse" : "bg-gray-800 text-gray-300"}`}>
              {playerTurn ? "✨ Your turn" : "🤖 Bot's turn"}
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
                      "bg-purple-300 text-black shadow-lg shadow-purple-300/50 scale-105" :
                      "bg-purple-900 text-white hover:bg-purple-800 border-2 border-purple-700 hover:border-purple-500"
                  }
                  ${!card.visible ? "" : "shadow-lg"}
                  transform hover:scale-105 active:scale-95
                `}
                onClick={() => card.visible && handleCardClick(card.id)}
                disabled={!card.visible || !playerTurn || flippedCards.length === 2}
              >
                {!card.visible ? "" :
                  flippedCards.some(c => c.id === card.id) ? (
                    <>
                      <span className="relative z-10 drop-shadow-md">{card.value}</span>
                      <div className="absolute inset-0 bg-white opacity-20 rounded-xl"></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-purple-700 opacity-80 rounded-xl"></div>
                  )
                }
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            onClick={resetGame}
            className="w-full py-2 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5"
          >
            Reset Game
          </button>

          {/* Game over modal */}
          {gameOver && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-20">
              <div className="bg-gradient-to-br from-purple-900 to-gray-900 p-6 rounded-xl max-w-sm w-full border-2 border-purple-500 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                  {playerScore > botScore ? "🎉 You Won!" :
                    playerScore < botScore ? "🤖 Bot Won!" :
                      "🤝 It's a Tie!"}
                </h2>
                <div className="text-center mb-6">
                  <p className="text-purple-200">Final Score:</p>
                  <div className="flex justify-center gap-8 mt-2">
                    <div className="text-xl font-bold text-purple-100">You: {playerScore}</div>
                    <div className="text-xl font-bold text-pink-100">Bot: {botScore}</div>
                  </div>
                </div>
                <button
                  onClick={resetGame}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full text-white font-bold transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global styles for animations */}
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
}

export default VsBot;