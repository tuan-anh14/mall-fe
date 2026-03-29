import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./styles/globals.css";

// Fix GTranslate vs React DOM Conflict (NotFoundError)
// GTranslate modifies DOM, React gets confused when unmounting.
// This patch prevents the app from crashing when React tries to remove a node that's already moved/removed by GTranslate.
if (typeof Node === "function" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  // @ts-ignore
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console) {
        console.warn("GTranslate fix: Tried to remove a node that is not a child of this node.", child, this);
      }
      return child;
    }
    // @ts-ignore
    return originalRemoveChild.apply(this, arguments);
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 phút
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);
