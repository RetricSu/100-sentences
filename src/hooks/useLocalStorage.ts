import { useState, useEffect, useCallback } from "react";

export interface SavedText {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = "click-to-read-saved-texts";

export function useLocalStorage() {
  const [savedTexts, setSavedTexts] = useState<SavedText[]>([]);
  const [loading, setLoading] = useState(true);

  // Load saved texts from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const textsWithDates = parsed.map((text: any) => ({
          ...text,
          createdAt: new Date(text.createdAt),
          updatedAt: new Date(text.updatedAt),
        }));
        setSavedTexts(textsWithDates);
      }
    } catch (error) {
      console.error("Error loading saved texts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save texts to localStorage whenever savedTexts changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTexts));
      } catch (error) {
        console.error("Error saving texts:", error);
      }
    }
  }, [savedTexts, loading]);

  // Generate a title from text content
  const generateTitle = useCallback((content: string): string => {
    const words = content.trim().split(/\s+/);
    const title = words.slice(0, 6).join(" ");
    return title.length > 50 ? title.substring(0, 50) + "..." : title;
  }, []);

  // Save a new text
  const saveText = useCallback(
    (content: string, customTitle?: string) => {
      if (!content.trim()) return null;

      const now = new Date();
      const newText: SavedText = {
        id: Date.now().toString(),
        title: customTitle || generateTitle(content),
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
      };

      setSavedTexts((prev) => [newText, ...prev]);
      return newText;
    },
    [generateTitle]
  );

  // Delete a text
  const deleteText = useCallback((id: string) => {
    setSavedTexts((prev) => prev.filter((text) => text.id !== id));
  }, []);

  // Clear all saved texts
  const clearAllTexts = useCallback(() => {
    setSavedTexts([]);
  }, []);

  return {
    savedTexts,
    loading,
    saveText,
    deleteText,
    clearAllTexts,
  };
}
