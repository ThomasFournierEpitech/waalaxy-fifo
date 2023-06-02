import React from "react";
import FifoDashboardElement from "./fifoDashboardElement";
import { FifoDashboardElementType } from "../types/fifoDashboardElementType";

export interface FifoDashboardProps {
  actions: FifoDashboardElementType[];
  addFifoElement: Function;
}

const FifoDashboard: React.FC<FifoDashboardProps> = ({
  actions,
  addFifoElement,
}) => {
  return (
    <>
      <div data-testid={`fifo-action-dashboard`}>
        <h2 className="">Dashboard</h2>
        <div className="row mb-5">
          {actions.map((action, index) => (
            <div key={index} className="col-auto">
              <button
                data-testid={`fifo-action-${action.id}`}
                id="btn-action-{action.id}"
                type="button"
                onClick={() => addFifoElement(action.id)}
                className="btn btn-secondary"
              >
                <FifoDashboardElement
                  id={action.id}
                  credit={action.credit}
                  maxCredit={action.maxCredit}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FifoDashboard;
