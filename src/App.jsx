import React from 'react'
import { TypingInput } from './components/TypingInput'
import { PredictionDisplay } from './components/PredictionDisplay'
import { DeleteButton } from './components/DeleteButton'
import { useTypingBehavior } from './hooks/useTypingBehavior'
import './App.css'

function App() {
  const {
    phase,
    timeRemaining,
    predictionScore,
    samplesCollected,
    handleKeystroke,
    reset
  } = useTypingBehavior()

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>Typing Behavior Anomaly Detector</h1>
          <p className="subtitle">
            AI-powered unsupervised learning model that detects anomalies in typing patterns
          </p>
        </header>

        <main className="app-main">
          <PredictionDisplay
            score={predictionScore}
            phase={phase}
            timeRemaining={timeRemaining}
            samplesCollected={samplesCollected}
          />

          <TypingInput
            onKeystroke={handleKeystroke}
            placeholder="Start typing here to begin automatic training..."
          />

          <div className="controls">
            <DeleteButton
              onDelete={reset}
              disabled={phase === 'idle' && samplesCollected === 0}
            />
          </div>
        </main>

        <footer className="app-footer">
          <div className="info-section">
            <h3>How it works:</h3>
            <ul>
              <li>Training starts automatically when you begin typing</li>
              <li>Model trains for 90 seconds on your typing patterns</li>
              <li>After training, anomaly scores are predicted in real-time</li>
              <li>Features: Previous key, Next key, Time intervals</li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App

