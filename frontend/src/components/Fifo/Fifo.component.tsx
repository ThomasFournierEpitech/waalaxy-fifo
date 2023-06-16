import Dashboard from './FifoDashboard/FifoDashboard.component';
import useFifo from '../../hooks/fifo.hook';
import FifoQueue from './FifoQueue/FifoQueue.component';
import FifoAlertSidebar from './FifoAlertSidebar/FifoAlertSidebar.component';
import useFifoAlert from '../../hooks/fifoAlert.hook';

const Fifo = () => {
  const { fifoAlerts, dismissFifoAlert, setFifoAlerts } = useFifoAlert();
  const { isConnected, actions, fifoElements, addFifoElement } =
    useFifo(setFifoAlerts);

  return (
    <>
      <div data-testid="fifo-component">
        {isConnected ? (
          <div className="d-flex container mt-5">
            <div className="flex-grow-1">
              <Dashboard actions={actions} addFifoElement={addFifoElement} />
              <FifoQueue fifoElements={fifoElements} />
            </div>
            <FifoAlertSidebar
              fifoAlerts={fifoAlerts}
              dismissFifoAlert={dismissFifoAlert}
            />
          </div>
        ) : (
          <p data-testid="fifo-no-server">Le Server n'est pas disponible...</p>
        )}
      </div>
    </>
  );
};

export default Fifo;
