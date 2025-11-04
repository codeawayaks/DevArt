import * as tf from '@tensorflow/tfjs'

/**
 * ModelManager - Handles TensorFlow.js model creation, training, and prediction
 * Uses an autoencoder-based approach for anomaly detection
 */
export class ModelManager {
  constructor() {
    this.model = null
    this.isTraining = false
    this.trainingData = []
    this.featureStats = null
  }

  /**
   * Create a new anomaly detection model
   * Uses a simple autoencoder architecture
   */
  createModel() {
    // Input layer: 3 features (prevKey, nextKey, timeInterval)
    // Encoder: 3 -> 2 -> 1
    // Decoder: 1 -> 2 -> 3
    // Anomaly score is reconstruction error
    
    const model = tf.sequential({
      layers: [
        // Encoder
        tf.layers.dense({
          inputShape: [3],
          units: 2,
          activation: 'relu',
          name: 'encoder1'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'relu',
          name: 'encoder2'
        }),
        // Decoder
        tf.layers.dense({
          units: 2,
          activation: 'relu',
          name: 'decoder1'
        }),
        tf.layers.dense({
          units: 3,
          activation: 'linear',
          name: 'decoder2'
        })
      ]
    })

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mse']
    })

    this.model = model
    return model
  }

  /**
   * Add training sample
   * @param {Array} normalizedFeatures - Normalized feature vector [prevKey, nextKey, timeInterval]
   * @param {Object} stats - Feature normalization statistics
   */
  addTrainingSample(normalizedFeatures, stats) {
    if (normalizedFeatures && normalizedFeatures.length === 3) {
      this.trainingData.push(normalizedFeatures)
      this.featureStats = stats
    }
  }

  /**
   * Train the model on collected data
   * @param {number} batchSize - Batch size for training
   * @returns {Promise} - Training promise
   */
  async train(batchSize = 10) {
    if (this.trainingData.length < batchSize) {
      return // Not enough data yet
    }

    if (this.isTraining) {
      return // Already training
    }

    if (!this.model) {
      this.createModel()
    }

    this.isTraining = true

    try {
      // Convert training data to tensor
      const xs = tf.tensor2d(this.trainingData)
      
      // For autoencoder, input and target are the same
      const ys = xs.clone()

      // Train the model
      await this.model.fit(xs, ys, {
        epochs: 10,
        batchSize: Math.min(batchSize, this.trainingData.length),
        shuffle: true,
        verbose: 0
      })

      // Clean up tensors
      xs.dispose()
      ys.dispose()
    } catch (error) {
      console.error('Training error:', error)
    } finally {
      this.isTraining = false
    }
  }

  /**
   * Predict anomaly score for a feature vector
   * @param {Array} normalizedFeatures - Normalized feature vector
   * @returns {Promise<number>} - Anomaly score (0-1, higher = more anomalous)
   */
  async predict(normalizedFeatures) {
    if (!this.model || !normalizedFeatures || normalizedFeatures.length !== 3) {
      return 0.5 // Default score if model not ready
    }

    try {
      // Convert to tensor
      const input = tf.tensor2d([normalizedFeatures])
      
      // Get prediction (reconstruction)
      const reconstruction = this.model.predict(input)
      
      // Calculate reconstruction error
      const original = input
      const error = tf.losses.meanSquaredError(original, reconstruction)
      
      // Get error value
      const errorValue = await error.data()
      const anomalyScore = Math.min(errorValue[0] * 10, 1.0) // Scale to 0-1
      
      // Clean up tensors
      input.dispose()
      reconstruction.dispose()
      error.dispose()
      
      return anomalyScore
    } catch (error) {
      console.error('Prediction error:', error)
      return 0.5
    }
  }

  /**
   * Get model state for saving
   * @returns {Promise<Object>} - Model state object
   */
  async getModelState() {
    if (!this.model) {
      return null
    }

    try {
      const weights = await this.model.getWeights()
      const weightData = await Promise.all(
        weights.map(w => w.array())
      )

      return {
        weights: weightData,
        featureStats: this.featureStats,
        trainingDataLength: this.trainingData.length
      }
    } catch (error) {
      console.error('Error getting model state:', error)
      return null
    }
  }

  /**
   * Load model state
   * @param {Object} modelState - Model state object
   */
  async loadModelState(modelState) {
    if (!modelState || !modelState.weights) {
      return false
    }

    try {
      // Create model first
      this.createModel()

      // Convert weight arrays back to tensors
      const weightTensors = modelState.weights.map(w => tf.tensor(w))

      // Set weights
      this.model.setWeights(weightTensors)

      // Restore feature stats
      this.featureStats = modelState.featureStats

      // Clean up
      weightTensors.forEach(t => t.dispose())

      return true
    } catch (error) {
      console.error('Error loading model state:', error)
      return false
    }
  }

  /**
   * Check if model is ready for prediction
   * @returns {boolean}
   */
  isReady() {
    return this.model !== null && this.trainingData.length >= 10
  }

  /**
   * Reset the model
   */
  reset() {
    if (this.model) {
      this.model.dispose()
    }
    this.model = null
    this.trainingData = []
    this.featureStats = null
    this.isTraining = false
  }
}

