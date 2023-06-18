import { render, fireEvent, screen } from '@testing-library/react';
import FifoDashboard from '../FifoDashboard.component';

describe('FifoDashboard e2e', () => {
  it('should render the component when actions are empty', () => {
    render(<FifoDashboard actions={[]} addFifoElement={jest.fn()} />);
    const titleElement = screen.getByTestId('fifo-action-dashboard');
    expect(titleElement).toBeInTheDocument();
  });

  it('should initialy render the correct number of action buttons', () => {
    const mockActions = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];

    render(<FifoDashboard actions={mockActions} addFifoElement={jest.fn()} />);
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons).toHaveLength(3);
  });

  it('should call addFifoElement when an action button is clicked', () => {
    const mockActions = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];

    const addFifoElementMock = jest.fn();
    render(
      <FifoDashboard
        actions={mockActions}
        addFifoElement={addFifoElementMock}
      />,
    );

    const actionButton = screen.getAllByRole('button');
    actionButton.forEach((actionButton, index) => {
      fireEvent.click(actionButton);
      expect(addFifoElementMock).toHaveBeenCalledTimes(1 + index);
    });
  });
});

// export {};
