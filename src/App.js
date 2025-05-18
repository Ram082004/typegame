import React, { useState, useEffect } from "react";
import Game from "./components/game.js";
import { motion, AnimatePresence } from "framer-motion";
import "./styles/style.css";

// Add this new component at the top with your other components
const CursorTrail = () => {
  const [trail, setTrail] = useState([]);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newPoint = {
        x: e.clientX,
        y: e.clientY,
        letter: letters[Math.floor(Math.random() * letters.length)],
        id: Date.now()
      };

      setTrail(prevTrail => [...prevTrail, newPoint].slice(-15)); // Keep last 15 points
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="cursor-trail">
      {trail.map((point, index) => (
        <motion.div
          key={point.id}
          className="trail-letter"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{
            scale: [1, 0],
            opacity: [0.8, 0],
            x: [point.x, point.x + (Math.random() * 100 - 50)],
            y: [point.y, point.y + (Math.random() * 100 - 50)],
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        >
          {point.letter}
        </motion.div>
      ))}
    </div>
  );
};

const ModeButton = ({ mode, onClick, className }) => (
  <motion.button 
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`mode-btn ${mode} ${className} glassmorphism`}
  >
    <span className="mode-icon">
      {mode === "easy" ? "🎯" : mode === "intermediate" ? "⚡" : "🏆"}
    </span>
    <span className="mode-text">
      {mode.charAt(0).toUpperCase() + mode.slice(1)}
    </span>
    <div className="mode-description">
      {mode === "easy" ? "4-letter words" : 
       mode === "intermediate" ? "6-letter words" : "8-letter words"}
    </div>
  </motion.button>
);

// Add this component for the reset button
const ResetButton = ({ onReset }) => (
  <motion.button
    className="reset-button glassmorphism"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onReset}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <span className="reset-icon">🔄</span>
    <span className="reset-text">Reset All Progress</span>
  </motion.button>
);

// Update the GameCompletionOverlay component definition
const GameCompletionOverlay = ({ mode, onReset, onChangeMode }) => (
  <motion.div
    className="game-completion-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div 
      className="completion-card glassmorphism"
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="completion-emoji"
      >
        🏆
      </motion.div>
      <h1 className="completion-title">Congratulations!</h1>
      <p className="completion-text">
        You've completed all levels in {mode} mode!
      </p>
      <div className="completion-actions">
        <motion.button
          className="mode-select-button glassmorphism"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChangeMode(null)}
        >
          Choose Another Mode
        </motion.button>
        <motion.button
          className="reset-button glassmorphism"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
        >
          Reset Progress
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

function App() {
  // Add showCompletion state
  const [showCompletion, setShowCompletion] = useState(false);
  const [mode, setMode] = useState(null);
  const [level, setLevel] = useState(null);
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      const savedProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}');
      setProgress(savedProgress);
      setIsLoading(false);
    };
    loadProgress();
  }, []);

  // Add useEffect to check for mode completion
  useEffect(() => {
    if (mode && progress[mode]) {
      const levelsInMode = 50; // Total levels per mode
      const completedLevels = Object.values(progress[mode]).filter(level => level.completed).length;
      
      if (completedLevels === levelsInMode) {
        setShowCompletion(true);
      }
    }
  }, [mode, progress]);

  const handleNextLevel = (nextLevel) => {
    setLevel(nextLevel);
  };

  // Update handleResetProgress to also reset showCompletion
  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem('gameProgress');
      setProgress({});
      setMode(null);
      setLevel(null);
      setShowCompletion(false);
      alert('All progress has been reset!');
    }
  };

  const renderLevelButton = (levelNum) => {
    const levelProgress = progress[mode]?.[levelNum];
    const stars = levelProgress?.stars || 0;
    const isLocked = levelNum > 1 && !progress[mode]?.[levelNum - 1]?.completed;

    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: levelNum * 0.03 }}
        whileHover={!isLocked && { scale: 1.05, y: -5 }}
        whileTap={!isLocked && { scale: 0.95 }}
        key={levelNum}
        onClick={() => !isLocked && setLevel(levelNum)}
        className={`level-btn glassmorphism ${isLocked ? 'locked' : 'unlocked'}`}
        disabled={isLocked}
      >
        <div className="level-content">
          <div className="level-number">{levelNum}</div>
          <div className="stars-container">
            {Array.from({ length: 3 }, (_, i) => (
              <motion.span
                key={i}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 + levelNum * 0.03 }}
                className={`star ${i < stars ? 'earned' : ''}`}
              >
                ★
              </motion.span>
            ))}
          </div>
          {isLocked && (
            <motion.div 
              className="lock-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              🔒
            </motion.div>
          )}
        </div>
      </motion.button>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        >
          ⌨️
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="app-container"
      >
        <CursorTrail />
        {!mode || !level ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="selection-screen glassmorphism"
          >
            <motion.div 
              className="title-container"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
            >
              <div className="title-icons">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  ⌨️
                </motion.span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  🚀
                </motion.span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  ⭐
                </motion.span>
              </div>
              <motion.h1 
                className="game-title"
                animate={{ 
                  scale: [1, 1.02, 1],
                  textShadow: [
                    "0 0 10px rgba(123, 31, 162, 0.5)",
                    "0 0 20px rgba(123, 31, 162, 0.8)",
                    "0 0 10px rgba(123, 31, 162, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Typing Master
              </motion.h1>
            </motion.div>
            
            {!mode ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="mode-selection-title">Select Your Challenge</h2>
                <div className="mode-selection">
                  <ModeButton mode="easy" onClick={() => setMode("easy")} />
                  <ModeButton mode="intermediate" onClick={() => setMode("intermediate")} />
                  <ModeButton mode="hard" onClick={() => setMode("hard")} />
                </div>
                <ResetButton onReset={handleResetProgress} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="level-selection-container"
              >
                <div className="level-header">
                  <motion.button
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode(null)}
                    className="back-button glassmorphism"
                  >
                    <span className="back-icon">←</span>
                    <span className="back-text">Back</span>
                  </motion.button>
                  
                  <motion.div className="mode-header"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="mode-title">{mode.toUpperCase()}</h1>
                    <h2 className="level-selection-title">Choose Level</h2>
                  </motion.div>
                </div>

                <motion.div 
                  className="levels-wrapper glassmorphism"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="level-grid">
                    {Array.from({ length: 50 }, (_, i) => renderLevelButton(i + 1))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <Game 
              mode={mode} 
              level={level} 
              onBack={() => setLevel(null)}
              onNextLevel={handleNextLevel}
            />
          </motion.div>
        )}
        {showCompletion && (
          <GameCompletionOverlay 
            mode={mode}
            onReset={handleResetProgress}
            onChangeMode={setMode}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
