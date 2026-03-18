import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import App from "./App";
import "./index.css";

// Some web3/auth deps still expect Node's global `Buffer`.
if ((globalThis as any).Buffer === undefined) {
  (globalThis as any).Buffer = Buffer;
}

createRoot(document.getElementById("root")!).render(<App />);
