import { render, screen } from "@testing-library/react";
import FifoQueue from "../fifoQueue";

describe("FifoQueue e2e", () => {
  it("should render component", () => {
    const mockFifoQueueElements = ["A", "A", "B"];
    render(<FifoQueue fifoElements={mockFifoQueueElements} />);

    const component = screen.getByTestId("fifo-queue");
    expect(component).toBeInTheDocument();
  });
});
