import React, { useEffect } from 'react';
import { FifoAlert } from '../../../hooks/fifoAlert.hook';

interface FifoAlertSidebarProps {
  fifoAlerts: FifoAlert[];
  dismissFifoAlert: (index: number) => void;
}

const FifoAlertSidebar: React.FC<FifoAlertSidebarProps> = ({
  fifoAlerts,
  dismissFifoAlert,
}) => {
  return (
    <div
      data-testid={`fifo-alert-sidebar`}
      style={{ width: 'clamp(200px, 50%, 400px)' }}
      className="d-flex flex-column vh-100 ps-3 position-absolute top-0 end-0 bottom-0"
    >
      {fifoAlerts.map((fifoAlert, index) => (
        <div
          data-testid={`fifo-alert-${index}`}
          className={`m-2 cursor-pointer alert alert-${fifoAlert.type}`}
          role="button"
          onClick={() => dismissFifoAlert(index)}
          key={index}
        >
          <div className={`p-3 position-relative`}>
            {fifoAlert.message}
            <h4 className="font-2 position-absolute top-0 end-0 bottom-0 ">
              X
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FifoAlertSidebar;
