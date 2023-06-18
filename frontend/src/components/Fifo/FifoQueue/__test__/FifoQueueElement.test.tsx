import { render, screen } from '@testing-library/react';
import FifoQueueElement from '../FifoQueueElement.component';

describe('FifoQueueElement e2e', () => {
  it('should render component', () => {
    const queueIndex = 0;
    const mockFifoQueueElement = 'A';
    render(
      <FifoQueueElement
        fifoQueueElement={mockFifoQueueElement}
        fifoQueueEIndex={queueIndex}
      />,
    );
    const component = screen.getByTestId(`fifo-element-${queueIndex}`);
    expect(component).toBeInTheDocument();
  });
});
