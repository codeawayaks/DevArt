import React from 'react'
import './PredictionDisplay.css'

/**
 * PredictionDisplay - Displays the anomaly prediction score
 */
export function PredictionDisplay({ score, phase, timeRemaining, samplesCollected }) {
  if (score === null && phase !== 'training') {
    return null
  }

  const getScoreColor = () => {
    if (score === null) return '#666'
    if (score < 0.3) return '#4caf50' // Green - normal
    if (score < 0.6) return '#ff9800' // Orange - suspicious
    return '#f44336' // Red - anomalous
  }

  const getScoreLabel = () => {
    if (score === null) return 'N/A'
    if (score < 0.3) return 'Normal'
    if (score < 0.6) return 'Suspicious'
    return 'Anomalous'
  }

  return (
    <div className="prediction-display">
      {phase === 'training' && (
        <div className="training-info">
          <div className="training-status">
            <span className="status-label">Training Phase</span>
            <span className="timer">{timeRemaining}s remaining</span>
          </div>
          <div className="samples-info">
            Samples collected: <strong>{samplesCollected}</strong>
          </div>
        </div>
      )}
      
      {phase === 'predicting' && score !== null && (
        <div className="prediction-info">
          <div className="score-container">
            <span className="score-label">Anomaly Score:</span>
            <span 
              className="score-value" 
              style={{ color: getScoreColor() }}
            >
              {(score * 100).toFixed(1)}%
            </span>
          </div>
          <div 
            className="score-label-text"
            style={{ color: getScoreColor() }}
          >
            {getScoreLabel()}
          </div>
        </div>
      )}

      {phase === 'idle' && (
        <div className="idle-info">
          Start typing to begin training...
        </div>
      )}
    </div>
  )
}

