import { useState, useEffect } from "react";
import { FifoDashboardElementType } from "../types/fifoDashboardElementType";
import { TWENTY_FOUR_HOURS, TWO_MINUTES } from "../config/timeConstants";

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
      return prevActions.map((prevAction) =>
        prevAction.id === actionId
          ? { ...prevAction, credit: prevAction.credit - 1 }
          : prevAction
      );
    });
  };

  const calculateCredits = () =>
    setActions((prevActions) =>
      prevActions.map((action: any) => {
        return {
          ...action,
          credit: Math.floor(
            Math.random() * (action.maxCredit * 0.2) + action.maxCredit * 0.8
          ),
        };
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
    const timer = setInterval(() => calculateCredits(), TWENTY_FOUR_HOURS);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => performAction(actions), TWO_MINUTES);

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
