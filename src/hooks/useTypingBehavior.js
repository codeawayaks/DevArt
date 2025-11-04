import { useState, useEffect, useRef, useCallback } from 'react'
import { FeatureExtractor } from '../services/FeatureExtractor'
import { ModelManager } from '../services/ModelManager'
import { StorageManager } from '../services/StorageManager'

const TRAINING_DURATION = 90 * 1000 // 90 seconds in milliseconds
const BATCH_TRAINING_SIZE = 10 // Train model every N samples

/**
 * Custom hook for managing typing behavior training and prediction
 */
export function useTypingBehavior() {
  const [phase, setPhase] = useState('idle') // 'idle', 'training', 'predicting'
  const [timeRemaining, setTimeRemaining] = useState(TRAINING_DURATION / 1000)
  const [predictionScore, setPredictionScore] = useState(null)
  const [samplesCollected, setSamplesCollected] = useState(0)
  
  const featureExtractorRef = useRef(new FeatureExtractor())
  const modelManagerRef = useRef(new ModelManager())
  const storageManagerRef = useRef(new StorageManager())
  const timerRef = useRef(null)
  const trainingStartTimeRef = useRef(null)
  const samplesSinceLastTrainingRef = useRef(0)

  // Initialize: Try to load existing model
  useEffect(() => {
    const loadModel = async () => {
      const savedModelState = storageManagerRef.current.loadModel()
      if (savedModelState) {
        const loaded = await modelManagerRef.current.loadModelState(savedModelState)
        if (loaded && savedModelState.featureStats) {
          featureExtractorRef.current.setStats(savedModelState.featureStats)
          setPhase('predicting')
          setSamplesCollected(savedModelState.trainingDataLength || 0)
        }
      }
    }
    loadModel()
  }, [])

  // Handle keystroke
  const handleKeystroke = useCallback(async (event) => {
    const featureExtractor = featureExtractorRef.current
    const modelManager = modelManagerRef.current

    // Extract features
    const rawFeatures = featureExtractor.extractFeatures(event)
    
    if (!rawFeatures) {
      return // First keystroke, not enough data
    }

    // Start training phase if idle
    if (phase === 'idle') {
      setPhase('training')
      trainingStartTimeRef.current = Date.now()
      
      // Start countdown timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - trainingStartTimeRef.current
        const remaining = Math.max(0, TRAINING_DURATION - elapsed)
        setTimeRemaining(Math.ceil(remaining / 1000))

        if (remaining <= 0) {
          clearInterval(timerRef.current)
          setPhase('predicting')
          // Final training pass
          modelManager.train(BATCH_TRAINING_SIZE).then(() => {
            // Save model after training completes
            modelManager.getModelState().then(state => {
              if (state) {
                storageManagerRef.current.saveModel(state)
              }
            })
          })
        }
      }, 100)
    }

    if (phase === 'training') {
      // Normalize features
      const normalizedFeatures = featureExtractor.normalizeFeatures(rawFeatures)
      
      if (normalizedFeatures) {
        // Add to training data
        const stats = featureExtractor.getStats()
        modelManager.addTrainingSample(normalizedFeatures, stats)
        
        setSamplesCollected(prev => prev + 1)
        samplesSinceLastTrainingRef.current += 1

        // Batch train every N samples
        if (samplesSinceLastTrainingRef.current >= BATCH_TRAINING_SIZE) {
          samplesSinceLastTrainingRef.current = 0
          await modelManager.train(BATCH_TRAINING_SIZE)
        }
      }
    } else if (phase === 'predicting') {
      // Normalize features using saved stats from model
      const stats = modelManager.featureStats
      const normalizedFeatures = featureExtractor.normalizeFeaturesWithStats(
        rawFeatures,
        stats
      )

      if (normalizedFeatures) {
        // Predict anomaly score
        const score = await modelManager.predict(normalizedFeatures)
        setPredictionScore(score)
      }
    }
  }, [phase])

  // Reset function
  const reset = useCallback(async () => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Reset state
    setPhase('idle')
    setTimeRemaining(TRAINING_DURATION / 1000)
    setPredictionScore(null)
    setSamplesCollected(0)
    
    // Reset managers
    featureExtractorRef.current.reset()
    modelManagerRef.current.reset()
    storageManagerRef.current.clearModel()
    
    trainingStartTimeRef.current = null
    samplesSinceLastTrainingRef.current = 0
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return {
    phase,
    timeRemaining,
    predictionScore,
    samplesCollected,
    handleKeystroke,
    reset
  }
}

