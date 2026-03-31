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

    const existingScript = document.querySelector('script[src*="float.js"]');
    if (existingScript) {
      // Re-initialize if script exists (GTranslate specific)
      // @ts-ignore
      if (window.GTranslate && typeof window.GTranslate.init === 'function') {
        // @ts-ignore
        window.GTranslate.init();
      }
      return;
    }

    // MutationObserver to detect dynamic content (modals/popups)
    const observer = new MutationObserver((mutations) => {
      let shouldRefresh = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Mark new nodes to be translated
              if (
                node.getAttribute("role") === "dialog" ||
                node.className.includes("modal") ||
                node.className.includes("portal") ||
                node.id?.includes("radix") // Common for shadcn/ui/radix
              ) {
                shouldRefresh = true;
              }
            }
          });
        }
      });

      if (shouldRefresh) {
        // Wait a bit for React to finish rendering the content inside the popup
        setTimeout(() => {
          // 1. Re-init GTranslate
          // @ts-ignore
          if (window.GTranslate && typeof window.GTranslate.init === "function") {
            // @ts-ignore
            window.GTranslate.init();
          }

          // 2. DOM POKE: Force Google Translate to wake up
          // Changing a data attribute on body triggers Google's mutation observer
          document.body.setAttribute("data-gt-refresh", Date.now().toString());
        }, 600); 
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Load GTranslate script
    const script = document.createElement("script");
    script.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="gtranslate_container notranslate" translate="no">
      <div className="gtranslate_wrapper"></div>
    </div>
  );
}
