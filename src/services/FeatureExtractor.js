/**
 * FeatureExtractor - Extracts features from keystroke events
 * Features: Previous key, Next key, Time interval between keystrokes
 */
export class FeatureExtractor {
  constructor() {
    this.lastKey = null
    this.lastKeyTime = null
    this.maxTimeInterval = 1000 // Maximum time interval for normalization (1 second)
    this.maxKeyCode = 255 // Maximum key code for normalization
  }

  /**
   * Extract features from a keystroke event
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {Object|null} - Feature object with prevKey, nextKey, timeInterval, or null if not enough data
   */
  extractFeatures(event) {
    const currentKey = event.keyCode || event.which || 0
    const currentTime = Date.now()

    // For the first keystroke, we don't have previous key yet
    if (this.lastKey === null || this.lastKeyTime === null) {
      this.lastKey = currentKey
      this.lastKeyTime = currentTime
      return null
    }

    // Calculate time interval
    const timeInterval = currentTime - this.lastKeyTime

    // Update max time interval for normalization
    if (timeInterval > this.maxTimeInterval) {
      this.maxTimeInterval = timeInterval
    }

    // Extract features
    const features = {
      prevKey: this.lastKey,
      nextKey: currentKey,
      timeInterval: timeInterval
    }

    // Update state
    this.lastKey = currentKey
    this.lastKeyTime = currentTime

    return features
  }

  /**
   * Normalize features to [0, 1] range
   * @param {Object} features - Raw feature object
   * @returns {Array} - Normalized feature vector [prevKey, nextKey, timeInterval]
   */
  normalizeFeatures(features) {
    if (!features) return null

    return [
      features.prevKey / this.maxKeyCode, // Normalize key code
      features.nextKey / this.maxKeyCode, // Normalize key code
      Math.min(features.timeInterval / this.maxTimeInterval, 1.0) // Normalize time interval
    ]
  }

  /**
   * Normalize features using provided statistics (for prediction)
   * @param {Object} features - Raw feature object
   * @param {Object} stats - Normalization statistics from training
   * @returns {Array} - Normalized feature vector
   */
  normalizeFeaturesWithStats(features, stats) {
    if (!features || !stats) return null

    return [
      features.prevKey / stats.maxKeyCode,
      features.nextKey / stats.maxKeyCode,
      Math.min(features.timeInterval / stats.maxTimeInterval, 1.0)
    ]
  }

  /**
   * Get normalization statistics for saving
   * @returns {Object} - Statistics object
   */
  getStats() {
    return {
      maxKeyCode: this.maxKeyCode,
      maxTimeInterval: this.maxTimeInterval
    }
  }

  /**
   * Set normalization statistics from loaded model
   * @param {Object} stats - Statistics object
   */
  setStats(stats) {
    if (stats) {
      this.maxKeyCode = stats.maxKeyCode || 255
      this.maxTimeInterval = stats.maxTimeInterval || 1000
    }
  }

  /**
   * Reset the feature extractor
   */
  reset() {
    this.lastKey = null
    this.lastKeyTime = null
    this.maxTimeInterval = 1000
  }
}

