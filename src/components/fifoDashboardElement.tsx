import React from "react";

export interface FifoDashboardElementProps {
  id: string;
  credit: number;
  maxCredit: number;
}

const FifoDashboardElement: React.FC<FifoDashboardElementProps> = ({
  id,
  credit,
  maxCredit,
}) => {
  return (
    <div className="d-flex">
      <h4 className="me-2">{id}</h4>
      <small data-testid={`fifo-action-value-${id}`}>
        ({credit}/{maxCredit})
      </small>
    </div>
  );
};

export default FifoDashboardElement;
