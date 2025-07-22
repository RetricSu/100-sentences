import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for tracking cursor position in an input element
 * Uses requestAnimationFrame for optimal performance
 */
export const useCursorPosition = () => {
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const updateCursorPosition = useCallback(() => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  }, []);

  const debouncedUpdateCursor = useCallback(() => {
    // Cancel any pending animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    // Schedule update for next frame
    rafIdRef.current = requestAnimationFrame(() => {
      updateCursorPosition();
      rafIdRef.current = null;
    });
  }, [updateCursorPosition]);

  const handleCursorEvent = useCallback(() => {
    debouncedUpdateCursor();
  }, [debouncedUpdateCursor]);

  return {
    cursorPosition,
    inputRef,
    handleCursorEvent,
    updateCursorPosition: debouncedUpdateCursor
  };
}; 
