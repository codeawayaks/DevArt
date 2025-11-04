import React from 'react'
import './DeleteButton.css'

/**
 * DeleteButton - Button to reset the model and restart training
 */
export function DeleteButton({ onDelete, disabled = false }) {
  return (
    <button
      className="delete-button"
      onClick={onDelete}
      disabled={disabled}
      title="Delete model and restart training"
    >
      <span className="delete-icon">🗑️</span>
      <span className="delete-text">Reset Model</span>
    </button>
  )
}

