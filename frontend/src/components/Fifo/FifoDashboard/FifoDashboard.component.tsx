import React from 'react';
import FifoDashboardElementComponent from './FifoDashboardElement.component';
import { FifoDashboardElement } from '../../../shared/fifo.type';

export interface FifoDashboardProps {
  actions: FifoDashboardElement[];
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
            <div key={index} className="col-xs-12 col-sm-auto">
              <button
                data-testid={`fifo-action-${action.id}`}
                id="btn-action-{action.id}"
                type="button"
                onClick={() => addFifoElement(action.id)}
                className="btn btn-secondary w-100 my-2"
              >
                <FifoDashboardElementComponent
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
