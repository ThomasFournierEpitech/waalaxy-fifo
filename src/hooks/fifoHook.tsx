import { useState, useEffect } from "react";
import { FifoDashboardElementType } from "../types/fifoDashboardElementType";

export const useFifo = (
  initialActions: FifoDashboardElementType[],
  initialFifoElements: String[]
) => {
  const [actions, setActions] = useState(initialActions);
  const [fifoElements, setFifoElements] = useState(initialFifoElements);

  const addFifoElement = (fifoElement: String) => {
    setFifoElements((prevFifoElements) => [...prevFifoElements, fifoElement]);
  };

  const getNextFifoElementId = (
    actions: FifoDashboardElementType[],
    queueElement: String[]
  ) =>
    queueElement.find((actionId) => {
      const filteredAction = actions.find((action) => action.id === actionId);
      if (!filteredAction || filteredAction.credit === 0) {
        return false;
      }
      return true;
    });

  const decreaseActionCreditByActionId = (actionId: String) => {
    setActions((prevActions) => {
      const updatedActions = prevActions.map((prevAction) =>
        prevAction.id === actionId
          ? { ...prevAction, credit: prevAction.credit - 1 }
          : prevAction
      );
      return updatedActions;
    });
  };

  const calculateCredits = () =>
    setActions((prevActions) =>
      prevActions.map((action: any) => {
        const randomCredits = Math.floor(
          Math.random() * (action.maxCredit * 0.2) + action.maxCredit * 0.8
        );
        return { ...action, credit: randomCredits };
      })
    );

  const performAction = (actions: FifoDashboardElementType[]) => {
    setFifoElements((prevFifoElements) => {
      const fifoElementId = getNextFifoElementId(actions, prevFifoElements);

      if (fifoElementId === undefined) return prevFifoElements;
      decreaseActionCreditByActionId(fifoElementId);
      const index = prevFifoElements.indexOf(fifoElementId);
      const newFifoElements = [...prevFifoElements];
      if (index !== -1) newFifoElements.splice(index, 1);
      return newFifoElements;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => calculateCredits(), 24 * 60 * 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => performAction(actions), 2 * 60 * 1000);

    return () => clearInterval(timer);
  }, [actions]);

  return {
    addFifoElement,
    actions,
    fifoElements,
    performAction,
    calculateCredits,
    getNextFifoElementId,
    decreaseActionCreditByActionId,
  };
};

export default useFifo;
