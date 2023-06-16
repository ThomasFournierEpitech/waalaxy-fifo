export interface FifoQueueElementProps {
  fifoQueueElement: String;
  fifoQueueEIndex: number;
}

const FifoQueueElement: React.FC<FifoQueueElementProps> = ({
  fifoQueueElement,
  fifoQueueEIndex,
}) => {
  return (
    <div
      className={`card mb-2`}
      data-testid={`fifo-element-${fifoQueueEIndex}`}
    >
      <div className="card-body">
        <h5 className="card-title">{fifoQueueElement}</h5>
      </div>
    </div>
  );
};

export default FifoQueueElement;
