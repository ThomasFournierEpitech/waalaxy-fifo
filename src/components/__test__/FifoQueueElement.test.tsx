import { render, screen } from "@testing-library/react";
import FifoQueueElement from "../fifoQueueElement";

describe("FifoQueueElement e2e", () => {
  it("should render component", () => {
    const mockFifoQueueElement = "A";
    render(
      <FifoQueueElement
        fifoQueueElement={mockFifoQueueElement}
        fifoQueueEIndex={0}
      />
    );
    const component = screen.getByTestId("fifo-element-0");
    expect(component).toBeInTheDocument();
  });
});
