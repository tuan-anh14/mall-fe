import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { X, ZoomIn, ZoomOut, Maximize2, RotateCcw, RotateCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useImagePreview } from "../../context/ImagePreviewContext";
import { Button } from "./button";

export function ImagePreview() {
  const { isOpen, imageUrl, closePreview } = useImagePreview();
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);

  // Reset scale and rotation when image changes or closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setScale(1);
        setRotation(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.5, 0.5));
  const handleRotateLeft = () => setRotation((r) => r - 90);
  const handleRotateRight = () => setRotation((r) => r + 90);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closePreview()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm cursor-zoom-out"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Header Controls */}
                <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
                  <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-1 shadow-2xl">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                      onClick={handleZoomOut}
                      disabled={scale <= 0.5}
                      title="Thu nhỏ"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center text-white text-xs font-bold font-mono">
                      {Math.round(scale * 100)}%
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                      onClick={handleZoomIn}
                      disabled={scale >= 4}
                      title="Phóng to"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-4 bg-white/20 mx-1" />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                      onClick={handleRotateLeft}
                      title="Xoay trái"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                      onClick={handleRotateRight}
                      title="Xoay phải"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-4 bg-white/20 mx-1" />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                      onClick={handleReset}
                      title="Đặt lại"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Dialog.Close asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-white bg-white/10 backdrop-blur-md hover:bg-red-500/80 rounded-full border border-white/20 transition-all shadow-2xl"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </Dialog.Close>
                </div>

                {/* Image Container */}
                <div
                  ref={constraintsRef}
                  className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative max-w-full max-h-full flex items-center justify-center"
                  >
                    <motion.img
                      src={imageUrl || ""}
                      alt="Preview"
                      animate={{
                        scale,
                        rotate: rotation
                      }}
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      drag={scale > 1}
                      dragConstraints={constraintsRef}
                      dragElastic={0.1}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={() => setIsDragging(false)}
                      className="max-w-[95vw] max-h-[85vh] object-contain select-none shadow-2xl"
                      loading="lazy"
                    />
                  </motion.div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
