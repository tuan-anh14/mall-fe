import React, { Suspense, lazy } from "react";
import { Smile } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Theme } from "emoji-picker-react";

// Lazy load to optimize bundle size
const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
  triggerClassName?: string;
  iconSize?: number;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  disabled?: boolean;
}

export function EmojiPickerButton({
  onEmojiSelect,
  triggerClassName = "",
  iconSize = 20,
  align = "end",
  side = "top",
  disabled = false,
}: EmojiPickerButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={`text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors rounded-lg ${triggerClassName}`}
        >
          <Smile style={{ width: iconSize, height: iconSize }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className="p-0 border-none shadow-2xl z-[300] bg-transparent w-auto"
      >
        <Suspense
          fallback={
            <div className="w-[320px] h-[400px] bg-white rounded-xl shadow-2xl flex items-center justify-center border border-gray-100">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          }
        >
          <EmojiPicker
            onEmojiClick={(emojiData) => onEmojiSelect(emojiData.emoji)}
            theme={Theme.LIGHT}
            width={320}
            height={400}
            searchPlaceholder="Tìm emoji..."
          />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
}
