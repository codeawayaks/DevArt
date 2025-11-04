import React, { useRef, useEffect } from 'react'
import './TypingInput.css'

/**
 * TypingInput - Input component that captures keystroke events
 */
export function TypingInput({ onKeystroke, placeholder = "Start typing here..." }) {
  const inputRef = useRef(null)

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleKeyDown = (event) => {
    // Call the keystroke handler
    if (onKeystroke) {
      onKeystroke(event)
    }
  }

  return (
    <div className="typing-input-container">
      <textarea
        ref={inputRef}
        className="typing-input"
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        rows={8}
        spellCheck={false}
      />
    </div>
  )
}

