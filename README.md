# Typing Behavior Anomaly Detector

A React.js application that uses TensorFlow.js to automatically train an unsupervised anomaly detection model on user typing behavior.

## Features

- **Automatic Training**: Training begins automatically when a user opens the page and starts typing
- **90-Second Training Phase**: Model trains for 90 seconds on real typing data
- **Three Features**: Previous key, Next key, Time interval between keystrokes
- **Unsupervised Learning**: Uses an autoencoder-based anomaly detection approach
- **Real-time Prediction**: After training, provides anomaly scores in real-time as the user types
- **Model Persistence**: Saves trained model to localStorage for reuse across sessions
- **Reset Functionality**: Delete button to clear model and restart training

## Technology Stack

- **React.js 18+**: UI framework
- **TensorFlow.js**: Machine learning library for web
- **Vite**: Build tool and development server

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## How It Works

1. **Training Phase** (90 seconds):
   - User starts typing → Training begins automatically
   - Features are extracted from each keystroke (prev key, next key, time interval)
   - Model is trained incrementally in batches
   - Timer counts down from 90 seconds

2. **Prediction Phase** (after training):
   - Training stops automatically after 90 seconds
   - Each new keystroke is analyzed for anomalies
   - Anomaly score (0-100%) is displayed in real-time
   - Model is saved to localStorage for future sessions

3. **Reset**:
   - Click "Reset Model" button to delete the model
   - Timer resets and training starts from the beginning

## Model Architecture

The anomaly detection model uses a simple autoencoder:
- **Input**: 3 normalized features (prev key, next key, time interval)
- **Encoder**: 3 → 2 → 1 (compression)
- **Decoder**: 1 → 2 → 3 (reconstruction)
- **Anomaly Score**: Reconstruction error (higher error = more anomalous)

## Project Structure

```
src/
  components/
    TypingInput.jsx          # Input field with key event capture
    PredictionDisplay.jsx   # Shows prediction score and training status
    DeleteButton.jsx        # Reset functionality
  services/
    ModelManager.js         # TensorFlow.js model operations
    FeatureExtractor.js     # Keystroke to feature conversion
    StorageManager.js       # Model persistence (localStorage)
  hooks/
    useTypingBehavior.js    # Main hook for training/prediction logic
  App.jsx                   # Main app component
  index.js                  # Entry point
```

## Development Notes

- Model is saved to localStorage after training completes
- Model automatically loads on page refresh if available
- Features are normalized to [0, 1] range for training
- Batch training occurs every 10 samples during training phase
- TensorFlow.js tensors are properly disposed to prevent memory leaks

