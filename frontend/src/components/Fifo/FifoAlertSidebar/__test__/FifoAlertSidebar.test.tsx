import { fireEvent, render, screen } from '@testing-library/react';
import FifoAlertSidebar from '../FifoAlertSidebar.component';
import { FifoAlert } from '../../../../hooks/fifoAlert.hook';

describe('FifoAlertSidebar', () => {
  const mockDismissFifoAlert = jest.fn();
  const fifoAlerts: FifoAlert[] = [
    { type: 'success', message: 'Alert 1' },
    { type: 'danger', message: 'Alert 2' },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component correctly', () => {
    //Arrange
    render(
      <FifoAlertSidebar
        fifoAlerts={fifoAlerts}
        dismissFifoAlert={mockDismissFifoAlert}
      />,
    );

    //Assert
    const titleElement = screen.getByTestId('fifo-alert-sidebar');
    expect(titleElement).toBeInTheDocument();
  });

  it('should render the component when there is no alert', () => {
    //Arrange
    render(
      <FifoAlertSidebar
        fifoAlerts={[]}
        dismissFifoAlert={mockDismissFifoAlert}
      />,
    );

    //Assert
    const titleElement = screen.getByTestId('fifo-alert-sidebar');
    expect(titleElement).toBeInTheDocument();
  });

  it('should call dismissFifoAlert when an alert is clicked', () => {
    //Arrange
    const indexToDismiss = 0;
    render(
      <FifoAlertSidebar
        fifoAlerts={fifoAlerts}
        dismissFifoAlert={mockDismissFifoAlert}
      />,
    );

    // Act
    fireEvent.click(screen.getByTestId(`fifo-alert-${indexToDismiss}`));

    // Assert
    expect(mockDismissFifoAlert).toHaveBeenCalledWith(indexToDismiss);
  });

  it('should render different alert types with appropriate classes', () => {
    //Arrange
    render(
      <FifoAlertSidebar
        fifoAlerts={fifoAlerts}
        dismissFifoAlert={mockDismissFifoAlert}
      />,
    );

    //Assert
    const successAlert = screen.getByTestId(`fifo-alert-${0}`);
    const errorAlert = screen.getByTestId(`fifo-alert-${1}`);
    expect(successAlert).toHaveClass('alert-success');
    expect(errorAlert).toHaveClass('alert-danger');
  });
});
