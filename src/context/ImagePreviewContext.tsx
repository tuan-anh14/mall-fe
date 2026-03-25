import React, { createContext, useContext, useState, useCallback } from "react";

interface ImagePreviewContextType {
  isOpen: boolean;
  imageUrl: string | null;
  openPreview: (url: string) => void;
  closePreview: () => void;
}

const ImagePreviewContext = createContext<ImagePreviewContextType | undefined>(undefined);

export function ImagePreviewProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const openPreview = useCallback((url: string) => {
    setImageUrl(url);
    setIsOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsOpen(false);
    // Delay clearing the URL to allow for exit animations
    setTimeout(() => {
        if (!isOpen) setImageUrl(null);
    }, 300);
  }, [isOpen]);

  return (
    <ImagePreviewContext.Provider value={{ isOpen, imageUrl, openPreview, closePreview }}>
      {children}
    </ImagePreviewContext.Provider>
  );
}

export function useImagePreview() {
  const context = useContext(ImagePreviewContext);
  if (context === undefined) {
    throw new Error("useImagePreview must be used within an ImagePreviewProvider");
  }
  return context;
}
