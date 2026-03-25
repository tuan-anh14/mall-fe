import React from "react";
import { cn } from "../ui/utils";
import { useImagePreview } from "../../context/ImagePreviewContext";
import { Maximize2 } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  className?: string;
  previewable?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  fallback = "https://placehold.co/600x400?text=No+Image",
  className,
  previewable = false,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = React.useState(src || fallback);
  const { openPreview } = useImagePreview();

  React.useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  const handlePreview = (e: React.MouseEvent) => {
    if (previewable && imgSrc) {
      e.preventDefault();
      e.stopPropagation();
      openPreview(imgSrc);
    }
  };

  return (
    <div className={cn("relative group overflow-hidden w-full h-full", previewable && "cursor-pointer", className)}>
      <img
        {...props}
        src={imgSrc}
        alt={alt}
        className={cn("w-full h-full object-cover transition-transform duration-500", previewable && "group-hover:scale-110")}
        onError={() => setImgSrc(fallback)}
        onClick={handlePreview}
      />
      
      {previewable && (
        <div 
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          onClick={handlePreview}
        >
          <div className="bg-white/90 p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <Maximize2 className="h-4 w-4 text-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}
