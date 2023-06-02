import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.css";
import Fifo from "./components/fifo";
import ActionJson from "./config/actions.json";
import FifoElementJson from "./config/fifoElements.json";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Fifo initialActions={ActionJson} initialFifoElements={FifoElementJson} />
  </React.StrictMode>
);
