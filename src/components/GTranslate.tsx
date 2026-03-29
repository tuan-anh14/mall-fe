import { useEffect } from "react";
import "./GTranslate.css";

declare global {
  interface Window {
    gtranslateSettings?: any;
  }
}

export function GTranslate() {
  useEffect(() => {
    // 1. Monkey Patch cho removeChild để tránh lỗi "The node to be removed is not a child of this node"
    // Lỗi này xảy ra khi GTranslate can thiệp vào DOM khiến React bị mất đồng bộ khi chuyển trang.
    if (typeof Node === "function" && Node.prototype) {
      const originalRemoveChild = Node.prototype.removeChild;
      // @ts-ignore
      Node.prototype.removeChild = function (child) {
        if (child.parentNode !== this) {
          return child; // Bỏ qua lỗi thay vì crash app
        }
        // @ts-ignore
        return originalRemoveChild.apply(this, arguments);
      };
    }

    // 2. Kiểm tra xem script đã tồn tại chưa để tránh nạp chồng
    const existingScript = document.querySelector('script[src*="float.js"]');
    if (existingScript) return;

    // 3. Cấu hình gtranslateSettings
    window.gtranslateSettings = {
      default_language: "vi",
      languages: ["vi", "en", "zh-CN", "ja"],
      wrapper_selector: ".gtranslate_wrapper",
      flag_size: 24,
      alt_flags: { en: "usa" },
      switcher_horizontal_position: "right",
      switcher_vertical_position: "top",
      float_switcher_open_direction: "bottom",
      show_widget_source: false,
    };

    // 4. Inject script
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
