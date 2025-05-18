import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/style.css";

const GAME_CONFIG = {
  easy: {
    words: 10,
    time: 60,
    length: 4
  },
  intermediate: {
    words: 20,
    time: 90, // 1:30 minutes
    length: 6
  },
  hard: {
    words: 30,
    time: 120, // 2 minutes
    length: 8
  }
};

const API_URLS = {
  easy: `https://random-word-api.vercel.app/api?words=${GAME_CONFIG.easy.words}&length=${GAME_CONFIG.easy.length}`,
  intermediate: `https://random-word-api.vercel.app/api?words=${GAME_CONFIG.intermediate.words}&length=${GAME_CONFIG.intermediate.length}`,
  hard: `https://random-word-api.vercel.app/api?words=${GAME_CONFIG.hard.words}&length=${GAME_CONFIG.hard.length}`
};

const STAR_CRITERIA = {
  easy: { 3: 95, 2: 85, 1: 75 },
  intermediate: { 3: 90, 2: 80, 1: 70 },
  hard: { 3: 85, 2: 75, 1: 65 }
};

const ResultsOverlay = ({ score, accuracy, wpm, words, levelCompleted, stars, onRetry, onNextLevel, level }) => (
  <motion.div 
    className="results-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div 
      className="results-card"
      initial={{ scale: 0.8, y: 50, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div 
        className="results-header"
        animate={{ 
          y: [0, -10, 0],
          transition: { duration: 2, repeat: Infinity }
        }}
      >
        {levelCompleted ? (
          <div className="completion-badge">
            <motion.span
              className="badge-icon"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎉
            </motion.span>
            <h2 className="badge-title">Level Complete!</h2>
          </div>
        ) : (
          <div className="timeout-badge">
            <motion.span
              className="badge-icon"
              animate={{ 
                rotate: [0, 180],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⏰
            </motion.span>
            <h2 className="badge-title">Time's Up!</h2>
          </div>
        )}
      </motion.div>

      <div className="results-stats-grid">
        <motion.div 
          className="result-stat-card"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5 }}
        >
          <span className="result-stat-icon">🎯</span>
          <span className="result-stat-value">{score}/{words.length}</span>
          <span className="result-stat-label">Words</span>
        </motion.div>

        <motion.div 
          className="result-stat-card"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5 }}
        >
          <span className="result-stat-icon">✨</span>
          <span className="result-stat-value">{accuracy}%</span>
          <span className="result-stat-label">Accuracy</span>
        </motion.div>

        <motion.div 
          className="result-stat-card"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ y: -5 }}
        >
          <span className="result-stat-icon">⚡</span>
          <span className="result-stat-value">{wpm}</span>
          <span className="result-stat-label">WPM</span>
        </motion.div>
      </div>

      <motion.div 
        className="stars-earned"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        {Array.from({ length: 3 }, (_, i) => (
          <motion.span
            key={i}
            className={`star ${i < stars ? 'earned' : ''}`}
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.7 + (i * 0.1) }}
          >
            ⭐
          </motion.span>
        ))}
      </motion.div>

      <div className="action-buttons">
        <motion.button
          className="retry-button glassmorphism"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
        >
          <span className="button-icon">🔄</span>
          <span>Try Again</span>
        </motion.button>

        {levelCompleted && level < 50 && (
          <motion.button
            className="next-button glassmorphism"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextLevel}
          >
            <span className="button-icon">➡️</span>
            <span>Next Level</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  </motion.div>
);

const StatsBar = ({ timer, accuracy, progress, words, wpm }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div className="stats-row">
      <motion.div className="stat-box" whileHover={{ y: -5 }}>
        <div className="stat-content">
          <motion.span className="stat-icon-wrapper">⏱️</motion.span>
          <span className="stat-value">{formatTime(timer)}</span>
          <span className="stat-label">Time Left</span>
        </div>
      </motion.div>

      <motion.div className="stat-box" whileHover={{ y: -5 }}>
        <div className="stat-content">
          <motion.span className="stat-icon-wrapper">💨</motion.span>
          <span className="stat-value">{wpm}</span>
          <span className="stat-label">WPM</span>
        </div>
      </motion.div>

      <motion.div className="stat-box" whileHover={{ y: -5 }}>
        <div className="stat-content">
          <motion.span className="stat-icon-wrapper">🎯</motion.span>
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">Accuracy</span>
        </div>
      </motion.div>

      <motion.div className="stat-box" whileHover={{ y: -5 }}>
        <div className="stat-content">
          <motion.span className="stat-icon-wrapper">📝</motion.span>
          <span className="stat-value">{progress}/{words.length}</span>
          <span className="stat-label">Progress</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

function Game({ mode, level, onBack, onNextLevel }) {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [accuracy, setAccuracy] = useState(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [stars, setStars] = useState(0);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  // Load saved progress and fetch words
  useEffect(() => {
    loadProgress();
    fetchWords();
    return () => clearInterval(intervalRef.current);
  }, [mode, level]);

  const loadProgress = () => {
    const savedProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}');
    if (savedProgress[mode]?.[level]) {
      setStars(savedProgress[mode][level].stars);
    }
  };

  const fetchWords = async () => {
    try {
      const response = await axios.get(API_URLS[mode]);
      const wordsCount = GAME_CONFIG[mode].words; // Get word count based on mode
      const wordsForLevel = response.data.slice(0, wordsCount); // Get correct number of words
      setWords(wordsForLevel);
    } catch (err) {
      console.error("Error fetching words:", err);
      // Fallback words with correct count for each mode
      const fallbackCount = GAME_CONFIG[mode].words;
      setWords(Array.from({ length: fallbackCount }, (_, i) => `${mode}-word-${i + 1}`));
    }
  };

  const startTimer = () => {
    setTypingStarted(true);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = (completed) => {
    clearInterval(intervalRef.current);
    setGameOver(true);
    setLevelCompleted(completed);
    calculateStats();
  };

  const calculateStats = () => {
    const currentAccuracy = (score / currentIndex) * 100;
    const timeSpent = 60 - timer;
    const calculatedWpm = Math.round((score / timeSpent) * 60);
    
    setWpm(calculatedWpm);
    setAccuracy(currentAccuracy.toFixed(1));
    
    let earnedStars = 0;
    if (currentAccuracy >= STAR_CRITERIA[mode][3]) earnedStars = 3;
    else if (currentAccuracy >= STAR_CRITERIA[mode][2]) earnedStars = 2;
    else if (currentAccuracy >= STAR_CRITERIA[mode][1]) earnedStars = 1;

    setStars(earnedStars);
    saveProgress(earnedStars);
  };

  const saveProgress = (earnedStars) => {
    const savedProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}');
    
    // Initialize the mode object if it doesn't exist
    if (!savedProgress[mode]) {
      savedProgress[mode] = {};
    }

    // Save the progress for current level
    savedProgress[mode][level] = {
      stars: Math.max(earnedStars, savedProgress[mode][level]?.stars || 0),
      completed: true
    };

    localStorage.setItem('gameProgress', JSON.stringify(savedProgress));
  };

  const renderStars = (count) => {
    return Array.from({ length: 3 }, (_, i) => (
      <span 
        key={i} 
        className={`text-3xl ${
          i < count ? 'text-yellow-400' : 'text-gray-600'
        }`}
      >
        ★
      </span>
    ));
  };

  const handleTyping = (e) => {
    const val = e.target.value;
    setInput(val);
    
    if (!typingStarted) {
      startTimer();
    }

    setTotalKeystrokes(prev => prev + 1);

    // Check if the current input is wrong
    if (!words[currentIndex].startsWith(val) && val.length > 0) {
      // Decrease progress for wrong input
      setScore(prev => Math.max(0, prev - 0.5));
      e.target.classList.add('wrong-input');
    } else {
      e.target.classList.remove('wrong-input');
    }

    if (val.trim() === words[currentIndex]) {
      setScore(prev => prev + 1);
      setCurrentIndex(prev => prev + 1);
      setInput("");
      
      // Calculate accuracy
      const newAccuracy = ((score / (currentIndex + 1)) * 100).toFixed(1);
      setAccuracy(newAccuracy);

      if (currentIndex + 1 >= words.length) {
        endGame(true);
      }
    }
  };

  const handleRetry = () => {
    setWords([]);
    setCurrentIndex(0);
    setInput("");
    setTimer(GAME_CONFIG[mode].time);
    setScore(0);
    setGameOver(false);
    setAccuracy(100);
    setTotalKeystrokes(0);
    setStars(0);
    setLevelCompleted(false);
    setTypingStarted(false);
    setWpm(0);
    fetchWords();
  };

  const handleNextLevel = () => {
    onNextLevel(level + 1);
    handleRetry();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="game-wrapper"
    >
      <div className="game-container">
        {/* Header Section */}
        <motion.div 
          className="game-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button 
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="back-button"
            onClick={onBack}
          >
            <span className="button-icon">←</span>
            <span className="button-text">Back</span>
          </motion.button>

          <motion.div 
            className="level-info"
            animate={{ 
              scale: [1, 1.02, 1],
              transition: { duration: 2, repeat: Infinity }
            }}
          >
            <h1 className="mode-title">{mode.toUpperCase()}</h1>
            <h2 className="level-title">Level {level}</h2>
          </motion.div>

          <div className="stars-display">
            {Array.from({ length: 3 }, (_, i) => (
              <motion.span
                key={i}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`star ${i < stars ? 'earned' : ''}`}
              >
                ★
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <StatsBar 
          timer={timer} 
          accuracy={accuracy} 
          progress={currentIndex} 
          words={words} 
          wpm={wpm} 
        />

        {/* Game Content */}
        {!gameOver ? (
          <motion.div 
            className="game-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="word-display"
              animate={{ 
                scale: [1, 1.02, 1],
                transition: { duration: 1.5, repeat: Infinity }
              }}
            >
              {words[currentIndex]}
            </motion.div>

            <motion.div 
              className="input-container"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleTyping}
                className="typing-input"
                placeholder="Start typing..."
                autoFocus
              />
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <ResultsOverlay 
              score={score} 
              accuracy={accuracy} 
              wpm={wpm} 
              words={words} 
              levelCompleted={levelCompleted} 
              stars={stars} 
              onRetry={handleRetry} 
              onNextLevel={handleNextLevel} 
              level={level} 
            />
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

export default Game;