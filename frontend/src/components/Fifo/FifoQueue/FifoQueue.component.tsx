import FifoElement from './FifoQueueElement.component';

export interface FifoProps {
  fifoElements: String[];
}

const FifoQueue: React.FC<FifoProps> = ({ fifoElements }) => {
  return (
    <div className="card" data-testid="fifo-queue">
      <div className="card-body">
        <h2 className="card-title mb-3">FIFO Queue</h2>
        {fifoElements.map((fifoQueueElement, index) => (
          <div key={index}>
            <FifoElement
              fifoQueueElement={fifoQueueElement}
              fifoQueueEIndex={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FifoQueue;
