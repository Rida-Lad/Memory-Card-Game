import React, { useState, useEffect } from "react";

const emojiPairs = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const initialCards = [
  ...emojiPairs.map((emoji, index) => ({ id: index * 2 + 1, value: emoji, visible: true })),
  ...emojiPairs.map((emoji, index) => ({ id: index * 2 + 2, value: emoji, visible: true }))
];

const shuffleCards = (cards) => [...cards].sort(() => Math.random() - 0.5);

function App() {
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
        if (Math.random() < 0.6 && botMemory.length > 0) {
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
    <div style={{fontFamily:'Atma'}} className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Animal Memory Match</h1>

        <div className="flex justify-between mb-6">
          <div className={`text-lg px-4 py-2 rounded ${playerTurn ? "bg-purple-800" : "bg-gray-800"}`}>
            You: {playerScore}
          </div>
          <div className={`text-lg px-4 py-2 rounded ${!playerTurn ? "bg-purple-800" : "bg-gray-800"}`}>
            Bot: {botScore}
          </div>
        </div>

        <div className="mb-4 text-center">
          <div className={`inline-block px-4 py-1 rounded-full text-sm ${playerTurn ? "bg-purple-900 text-purple-100" : "bg-gray-800 text-gray-300"
            }`}>
            {playerTurn ? "Your turn" : "Bot's turn"}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {cards.map((card) => (
            <button
              key={card.id}
              className={`
              aspect-square flex items-center justify-center text-3xl 
              rounded transition-all duration-300 
              ${!card.visible ? "invisible" :
                  flippedCards.some(c => c.id === card.id) ?
                    "bg-purple-300 text-black" :
                    "bg-purple-800 text-white hover:bg-purple-700"
                }
              ${!card.visible ? "" : "shadow-lg"}
              transform hover:scale-105 active:scale-95
            `}
              onClick={() => card.visible && handleCardClick(card.id)}
              disabled={!card.visible || !playerTurn || flippedCards.length === 2}
            >
              {!card.visible ? "" :
                flippedCards.some(c => c.id === card.id) ? card.value : ""}
            </button>
          ))}
        </div>

        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="bg-purple-900 p-6 rounded-lg max-w-sm w-full border-2 border-purple-500">
              <h2 className="text-2xl font-bold mb-4 text-center text-purple-200">
                {playerScore > botScore ? "You Won!" :
                  playerScore < botScore ? "Bot Won!" :
                    "It's a Tie!"}
              </h2>
              <button
                onClick={resetGame}
                className="w-full py-2 bg-purple-700 hover:bg-purple-600 rounded transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;