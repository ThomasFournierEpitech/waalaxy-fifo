import { render, screen } from '@testing-library/react';
import FifoDashboardElement from '../FifoDashboardElement.component';

describe('FifoDashboardElement e2e', () => {
  it('should render component', () => {
    const mockAction = { id: 'A', maxCredit: 20, credit: 40 };
    render(
      <FifoDashboardElement
        id={mockAction.id}
        credit={mockAction.credit}
        maxCredit={mockAction.maxCredit}
      />,
    );
    const idElement = screen.getByText(mockAction.id);
    expect(idElement).toBeInTheDocument();
  });

  it('should render the action credit and max credit correctly', () => {
    const mockAction = { id: 'A', maxCredit: 20, credit: 20 };
    render(
      <FifoDashboardElement
        id={mockAction.id}
        credit={mockAction.credit}
        maxCredit={mockAction.maxCredit}
      />,
    );
    const creditElement = screen.getByText(
      `(${mockAction.credit}/${mockAction.maxCredit})`,
    );
    expect(creditElement).toBeInTheDocument();
  });
});
