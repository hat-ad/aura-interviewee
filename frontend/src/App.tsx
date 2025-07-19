import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import "./App.css";
import Main from "./pages";
function App() {
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add("dark");
  }, []);
  return (
    <>
      <Toaster />
      <Main />
    </>
  );
}

export default App;
