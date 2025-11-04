/**
 * StorageManager - Handles model persistence using localStorage
 * Stores model weights, configuration, and feature statistics
 */
export class StorageManager {
  constructor() {
    this.storageKey = 'typingBehaviorModel'
  }

  /**
   * Save model to localStorage
   * @param {Object} modelState - Model state object from ModelManager
   * @returns {boolean} - Success status
   */
  saveModel(modelState) {
    try {
      if (!modelState) {
        return false
      }

      const dataToSave = {
        modelState: modelState,
        timestamp: Date.now(),
        version: '1.0'
      }

      const jsonString = JSON.stringify(dataToSave)
      localStorage.setItem(this.storageKey, jsonString)
      return true
    } catch (error) {
      console.error('Error saving model:', error)
      
      // If localStorage is full, try to clear old data
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data')
        this.clearModel()
        try {
          const jsonString = JSON.stringify({
            modelState: modelState,
            timestamp: Date.now(),
            version: '1.0'
          })
          localStorage.setItem(this.storageKey, jsonString)
          return true
        } catch (retryError) {
          console.error('Failed to save after clearing:', retryError)
          return false
        }
      }
      
      return false
    }
  }

  /**
   * Load model from localStorage
   * @returns {Object|null} - Model state object or null if not found
   */
  loadModel() {
    try {
      const savedData = localStorage.getItem(this.storageKey)
      
      if (!savedData) {
        return null
      }

      const parsed = JSON.parse(savedData)
      return parsed.modelState || null
    } catch (error) {
      console.error('Error loading model:', error)
      return null
    }
  }

  /**
   * Check if a model exists in storage
   * @returns {boolean}
   */
  modelExists() {
    return localStorage.getItem(this.storageKey) !== null
  }

  /**
   * Clear model from storage
   * @returns {boolean} - Success status
   */
  clearModel() {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('Error clearing model:', error)
      return false
    }
  }

  /**
   * Get model metadata (timestamp, version)
   * @returns {Object|null}
   */
  getMetadata() {
    try {
      const savedData = localStorage.getItem(this.storageKey)
      if (!savedData) {
        return null
      }

      const parsed = JSON.parse(savedData)
      return {
        timestamp: parsed.timestamp,
        version: parsed.version
      }
    } catch (error) {
      console.error('Error getting metadata:', error)
      return null
    }
  }
}

