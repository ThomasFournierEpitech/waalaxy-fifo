import {
  render,
  act,
  cleanup,
  screen,
  renderHook,
  fireEvent,
} from "@testing-library/react";
import Fifo from "../fifo";
import useFifo from "../../hooks/fifoHook";
import ActionJson from "../../config/actions.json";
import FifoElementsJson from "../../config/fifoElements.json";
import { TWENTY_FOUR_HOURS, TWO_MINUTES } from "../../config/timeConstants";

jest.useFakeTimers();

describe("Fifo component unit test", () => {
  afterEach(() => {
    jest.clearAllTimers(); // Réinitialise tous les timers
    jest.restoreAllMocks(); // Restaure tous les mocks
    cleanup(); // Nettoie les éléments rendus par le test
  });

  describe("initial state basic tests", () => {
    it("should initial phase be equal to the config data", () => {
      const { result } = renderHook(() =>
        useFifo(ActionJson, FifoElementsJson)
      );
      expect(result.current.actions).toEqual(ActionJson);
      expect(result.current.fifoElements).toEqual(FifoElementsJson);
    });
  });

  describe("getNextFifoElementId basic tests", () => {
    it("should get first ElementId", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 18 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      const elementId = result.current.getNextFifoElementId(
        result.current.actions,
        result.current.fifoElements
      );
      expect(elementId).toEqual("A");
    });

    it("should get first ElementId with credits not equal to 0", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 0 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 0 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      const elementId = result.current.getNextFifoElementId(
        result.current.actions,
        result.current.fifoElements
      );
      expect(elementId).toEqual("B");
    });
  });

  describe("addFifoElement basic tests", () => {
    it("should add element at the end of the queue", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 18 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.addFifoElement("A");
      });

      const fifoElementsAfter = result.current.fifoElements;
      expect(fifoElementsAfter).toEqual(["A", "B", "C", "A"]);
    });

    it("should add element at the end of the queue even with no credit", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 0 },
        { id: "B", maxCredit: 20, credit: 0 },
        { id: "C", maxCredit: 30, credit: 0 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.addFifoElement("A");
      });

      const fifoElementsAfter = result.current.fifoElements;
      expect(fifoElementsAfter).toEqual(["A", "B", "C", "A"]);
    });
  });

  describe("decreaseActionCreditByActionId basic tests", () => {
    it("should decrease credits", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 18 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.decreaseActionCreditByActionId("A");
      });

      const actionsAfter = result.current.actions;
      const actionShouldBe = [
        { id: "A", maxCredit: 20, credit: 19 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 18 },
      ];
      expect(actionsAfter).not.toEqual(initialActions);
      expect(actionsAfter).toEqual(actionShouldBe);
    });
  });

  describe("performAction basic tests", () => {
    it("should shift first element", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 18 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.performAction(result.current.actions);
      });

      const fifoElementsAfter = result.current.fifoElements;
      expect(fifoElementsAfter).toEqual(["B", "C"]);
    });

    it("should shift no element if none are valide", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 0 },
        { id: "B", maxCredit: 20, credit: 0 },
        { id: "C", maxCredit: 30, credit: 0 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.performAction(result.current.actions);
      });

      const fifoElementsAfter = result.current.fifoElements;
      const actionsAfter = result.current.actions;
      expect(fifoElementsAfter).toEqual(initialFifoElements);
      expect(actionsAfter).toEqual(initialActions);
    });
  });

  describe("calculateCredits basic tests", () => {
    it("should randomise credits to 100% of maxCredits value when Math.random trigger at 1", () => {
      const initialActions = [{ id: "A", maxCredit: 100, credit: 10 }];
      const initialFifoElements = ["A"];

      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(1);
        result.current.calculateCredits();
      });

      expect(result.current.actions[0].credit).toBe(100);
    });

    it("should randomise credits to 90% of maxCredits value when Math.random trigger at 0.5", () => {
      const initialActions = [{ id: "A", maxCredit: 100, credit: 10 }];
      const initialFifoElements = ["A"];

      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(0.5);
        result.current.calculateCredits();
      });

      expect(result.current.actions[0].credit).toBe(90);
    });

    it("should handle 0 maxCredit", () => {
      const initialActions = [{ id: "A", maxCredit: 0, credit: 10 }];
      const initialFifoElements = ["A"];

      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(0.5);
        result.current.calculateCredits();
      });

      expect(result.current.actions[0].credit).toBe(0);
      expect(result.current.actions[0].credit).toBe(0);
    });
  });

  describe("complex tests", () => {
    it("should shift first element with enought credits and decrease appropriate credit", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 0 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 18 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.performAction(result.current.actions);
      });

      const fifoElementsAfter = result.current.fifoElements;
      expect(fifoElementsAfter).toEqual(["A", "C"]);
      const actionsAfter = result.current.actions;
      const actionShouldBe = [
        { id: "A", maxCredit: 20, credit: 0 },
        { id: "B", maxCredit: 20, credit: 19 },
        { id: "C", maxCredit: 30, credit: 18 },
      ];
      expect(actionsAfter).toEqual(actionShouldBe);
    });

    it("test excercice", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(1);

      const initialActions = [
        { id: "A", maxCredit: 20, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 28 },
      ];
      const initialFifoElements: string[] = [];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.addFifoElement("A");
        result.current.addFifoElement("A");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("C");
        result.current.addFifoElement("C");
        result.current.addFifoElement("A");
        result.current.addFifoElement("A");
      });

      const fifoElementsAfter = result.current.fifoElements;
      expect(fifoElementsAfter).toEqual([
        "A",
        "A",
        "B",
        "B",
        "B",
        "B",
        "B",
        "C",
        "C",
        "A",
        "A",
      ]);
    });

    it("test excercice 2", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(1);

      const initialActions = [
        { id: "A", maxCredit: 20, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 28 },
      ];
      const initialFifoElements: string[] = [];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.addFifoElement("A");
        result.current.addFifoElement("A");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("C");
        result.current.addFifoElement("C");
        result.current.addFifoElement("A");
        result.current.addFifoElement("A");

        jest.advanceTimersByTime(TWO_MINUTES);
      });

      const fifoElementsAfter = result.current.fifoElements;
      expect(fifoElementsAfter).toEqual([
        "A",
        "B",
        "B",
        "B",
        "B",
        "B",
        "C",
        "C",
        "A",
        "A",
      ]);

      const actionsAfter = result.current.actions;
      const actionShouldBe = [
        { id: "A", maxCredit: 20, credit: 19 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 28 },
      ];
      expect(actionsAfter).toEqual(actionShouldBe);
    });

    it("test multiple add and remove", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(1);

      const initialActions = [
        { id: "A", maxCredit: 20, credit: 19 },
        { id: "B", maxCredit: 20, credit: 19 },
        { id: "C", maxCredit: 30, credit: 28 },
      ];
      const initialFifoElements: string[] = [];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.addFifoElement("A");
        result.current.addFifoElement("A");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("C");
        result.current.addFifoElement("C");
        result.current.addFifoElement("A");
        result.current.addFifoElement("A");

        jest.advanceTimersByTime(TWO_MINUTES);
        jest.advanceTimersByTime(TWO_MINUTES);
        jest.advanceTimersByTime(TWO_MINUTES);
      });

      const fifoElementsAfter = result.current.fifoElements;
      expect(fifoElementsAfter).toEqual([
        "B",
        "B",
        "B",
        "B",
        "C",
        "C",
        "A",
        "A",
      ]);

      const actionsAfter = result.current.actions;
      const actionShouldBe = [
        { id: "A", maxCredit: 20, credit: 17 },
        { id: "B", maxCredit: 20, credit: 18 },
        { id: "C", maxCredit: 30, credit: 28 },
      ];
      expect(actionsAfter).toEqual(actionShouldBe);
    });

    it("test multiple add, remove and a calculation", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(1);

      const initialActions = [
        { id: "A", maxCredit: 20, credit: 19 },
        { id: "B", maxCredit: 20, credit: 19 },
        { id: "C", maxCredit: 30, credit: 28 },
      ];
      const initialFifoElements: string[] = [];
      const { result } = renderHook(() =>
        useFifo(initialActions, initialFifoElements)
      );

      act(() => {
        result.current.addFifoElement("A");
        result.current.addFifoElement("A");
        result.current.addFifoElement("A");
        result.current.addFifoElement("A");
        jest.advanceTimersByTime(TWO_MINUTES);
        jest.advanceTimersByTime(TWO_MINUTES);
        result.current.addFifoElement("B");
        result.current.addFifoElement("B");
        result.current.addFifoElement("C");
        jest.advanceTimersByTime(TWO_MINUTES);
        jest.advanceTimersByTime(TWO_MINUTES);
        jest.advanceTimersByTime(TWO_MINUTES);
        jest.advanceTimersByTime(TWO_MINUTES);
        jest.advanceTimersByTime(TWO_MINUTES);
      });

      act(() => {
        jest.advanceTimersByTime(TWENTY_FOUR_HOURS - 7 * TWO_MINUTES);
      });

      const fifoElementsAfter = result.current.fifoElements;
      expect(fifoElementsAfter).toEqual([]);

      const actionsAfter = result.current.actions;
      const actionShouldBe = [
        { id: "A", maxCredit: 20, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 30, credit: 30 },
      ];
      expect(actionsAfter).toEqual(actionShouldBe);
    });
  });
});

describe("Fifo component e2e", () => {
  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
    cleanup();
  });

  describe("basic tests", () => {
    it("should render component", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 100 },
        { id: "B", maxCredit: 20, credit: 100 },
        { id: "C", maxCredit: 30, credit: 100 },
      ];

      const initialFifoElements = ["A", "B", "C"];
      render(
        <Fifo
          initialActions={initialActions}
          initialFifoElements={initialFifoElements}
        />
      );
      const FifoHtml = screen.getByTestId("fifo-component");
      expect(FifoHtml).toBeInTheDocument();
    });

    it("should shift a fifoElement after 2 minutes", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 100 },
        { id: "B", maxCredit: 20, credit: 100 },
        { id: "C", maxCredit: 30, credit: 100 },
      ];
      const initialFifoElements = ["A", "B", "C"];

      render(
        <Fifo
          initialActions={initialActions}
          initialFifoElements={initialFifoElements}
        />
      );

      act(() => {
        jest.advanceTimersByTime(TWO_MINUTES);
      });

      const fifoElementsHtml = screen.getAllByTestId(/^fifo-element-/);
      expect(fifoElementsHtml.length).toBe(2);
    });

    it("should not shift a fifoElement before 2 minutes", () => {
      const initialActions = [
        { id: "A", maxCredit: 20, credit: 100 },
        { id: "B", maxCredit: 20, credit: 100 },
        { id: "C", maxCredit: 30, credit: 100 },
      ];

      const initialFifoElements = ["A", "B", "C"];
      render(
        <Fifo
          initialActions={initialActions}
          initialFifoElements={initialFifoElements}
        />
      );

      act(() => {
        jest.advanceTimersByTime(TWO_MINUTES - 1000);
      });

      let fifoElementsHtml = screen.getAllByTestId(/^fifo-element-/);
      expect(fifoElementsHtml.length).toBe(3);
    });

    it("should update actions after 24 hours", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(1);

      const initialActions = [
        { id: "A", maxCredit: 20, credit: 0 },
        { id: "B", maxCredit: 30, credit: 0 },
        { id: "C", maxCredit: 10, credit: 0 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      render(
        <Fifo
          initialActions={initialActions}
          initialFifoElements={initialFifoElements}
        />
      );

      act(() => {
        jest.advanceTimersByTime(TWENTY_FOUR_HOURS);
      });

      initialFifoElements.forEach((fifoElement, index) => {
        const fifoElementsHtmlAfter = screen.getByTestId(
          `fifo-action-value-${fifoElement}`
        );

        expect(fifoElementsHtmlAfter).toHaveTextContent(
          `(${initialActions[index].maxCredit}/${initialActions[index].maxCredit})`
        );
      });
    });

    it("should not update actions before 24 hours", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(1);

      const initialActions = [
        { id: "A", maxCredit: 20, credit: 0 },
        { id: "B", maxCredit: 30, credit: 0 },
        { id: "C", maxCredit: 10, credit: 0 },
      ];
      const initialFifoElements = ["A", "B", "C"];
      render(
        <Fifo
          initialActions={initialActions}
          initialFifoElements={initialFifoElements}
        />
      );

      act(() => {
        jest.advanceTimersByTime(TWENTY_FOUR_HOURS - 1000);
      });

      initialFifoElements.forEach((fifoElement, index) => {
        const fifoElementsHtmlAfter = screen.getByTestId(
          `fifo-action-value-${fifoElement}`
        );

        expect(fifoElementsHtmlAfter).toHaveTextContent(
          `(${initialActions[index].credit}/${initialActions[index].maxCredit})`
        );
      });
    });
  });

  describe("complex tests", () => {
    it("test excercice", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(1);

      const initialActions = [
        { id: "A", maxCredit: 18, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 29, credit: 30 },
      ];
      const initialFifoElements: string[] = [];
      render(
        <Fifo
          initialActions={initialActions}
          initialFifoElements={initialFifoElements}
        />
      );
      const buttonA = screen.getByTestId("fifo-action-A");
      const buttonB = screen.getByTestId("fifo-action-B");
      const buttonC = screen.getByTestId("fifo-action-C");

      fireEvent.click(buttonA);
      fireEvent.click(buttonA);
      fireEvent.click(buttonB);
      fireEvent.click(buttonB);
      fireEvent.click(buttonB);
      fireEvent.click(buttonB);
      fireEvent.click(buttonB);
      fireEvent.click(buttonC);
      fireEvent.click(buttonC);
      fireEvent.click(buttonA);
      fireEvent.click(buttonA);

      let fifoElementsHtml = screen.getAllByTestId(/^fifo-element-/);
      expect(fifoElementsHtml.length).toBe(11);
    });

    it("test excercice 2", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(1);

      const initialActions = [
        { id: "A", maxCredit: 18, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 29, credit: 30 },
      ];
      const initialFifoElements: string[] = [];
      render(
        <Fifo
          initialActions={initialActions}
          initialFifoElements={initialFifoElements}
        />
      );
      const buttonA = screen.getByTestId("fifo-action-A");
      const buttonB = screen.getByTestId("fifo-action-B");
      const buttonC = screen.getByTestId("fifo-action-C");

      fireEvent.click(buttonA);
      fireEvent.click(buttonA);
      fireEvent.click(buttonB);
      fireEvent.click(buttonB);
      fireEvent.click(buttonB);
      fireEvent.click(buttonB);
      fireEvent.click(buttonB);
      fireEvent.click(buttonC);
      fireEvent.click(buttonC);
      fireEvent.click(buttonA);
      fireEvent.click(buttonA);

      act(() => {
        jest.advanceTimersByTime(TWO_MINUTES);
      });

      let fifoElementsHtml = screen.getAllByTestId(/^fifo-element-/);
      expect(fifoElementsHtml.length).toBe(10);
    });

    it("should remove all but one fifoElement", () => {
      jest.spyOn(global.Math, "random").mockReturnValue(1);

      const initialActions = [
        { id: "A", maxCredit: 18, credit: 20 },
        { id: "B", maxCredit: 20, credit: 20 },
        { id: "C", maxCredit: 29, credit: 30 },
      ];
      const initialFifoElements: string[] = ["A", "A", "B", "C"];
      render(
        <Fifo
          initialActions={initialActions}
          initialFifoElements={initialFifoElements}
        />
      );

      act(() => {
        jest.advanceTimersByTime(TWO_MINUTES);
      });

      act(() => {
        jest.advanceTimersByTime(TWO_MINUTES);
      });

      act(() => {
        jest.advanceTimersByTime(TWO_MINUTES);
      });

      let fifoElementsHtml = screen.getAllByTestId(/^fifo-element-/);
      expect(fifoElementsHtml.length).toBe(1);
    });
  });
});
