import { useEffect } from "react";
import "./GTranslate.css";

declare global {
  interface Window {
    gtranslateSettings?: any;
  }
}

export function GTranslate() {
  useEffect(() => {
    if (typeof Node === "function" && Node.prototype) {
      const originalRemoveChild = Node.prototype.removeChild;
      // @ts-ignore
      Node.prototype.removeChild = function (child) {
        if (child.parentNode !== this) {
          return child;
        }
        // @ts-ignore
        return originalRemoveChild.apply(this, arguments);
      };
    }

    const existingScript = document.querySelector('script[src*="float.js"]');
    if (existingScript) return;

    window.gtranslateSettings = {
      default_language: "vi",
      languages: ["vi", "en", "zh-CN", "ja"],
      wrapper_selector: ".gtranslate_wrapper",
      flag_size: 24,
      alt_flags: { en: "usa" },
      switcher_horizontal_position: "left",
      switcher_vertical_position: "bottom",
      float_switcher_open_direction: "top",
      show_widget_source: false,
    };

    const script = document.createElement("script");
    script.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="gtranslate_container notranslate" translate="no">
      <div className="gtranslate_wrapper"></div>
    </div>
  );
}
