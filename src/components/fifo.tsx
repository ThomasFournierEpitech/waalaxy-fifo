import Dashboard from "./fifoDashboard";
import useFifo from "../hooks/fifoHook";
import FifoQueue from "./fifoQueue";
import { FifoDashboardElementType } from "../types/fifoDashboardElementType";
import { useMemo } from "react";

export interface FifoProps {
  initialActions: FifoDashboardElementType[];
  initialFifoElements: String[];
}

const Fifo: React.FC<FifoProps> = ({ initialActions, initialFifoElements }) => {
  const { actions, fifoElements, addFifoElement } = useFifo(
    initialActions,
    initialFifoElements
  );
  return (
    <div className="container mt-5" data-testid="fifo-component">
      <Dashboard actions={actions} addFifoElement={addFifoElement} />
      <FifoQueue fifoElements={fifoElements} />
    </div>
  );
};

export default Fifo;
