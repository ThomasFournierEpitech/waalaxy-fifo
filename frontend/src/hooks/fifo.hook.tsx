import { useState, useEffect, Dispatch } from 'react';
import fifoService from '../services/fifo.service';
import {
  FifoDashboardElement,
  FifoEvent,
  FifoPayloadPerformAction,
  FifoEventsEnum,
} from '../shared/fifo.type';
import { FifoAlert } from './fifoAlert.hook';

import { socket } from '../socket';

export const useFifo = (
  setFifoAlerts: Dispatch<React.SetStateAction<FifoAlert[]>>,
) => {
  const [actions, setActions] = useState<FifoDashboardElement[]>([]);
  const [fifoElements, setFifoElements] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const addFifoElement = async (fifoElement: string, signal?: AbortSignal) => {
    const result = await fifoService.postFifoQueueElement(
      fifoElement,
      setFifoAlerts,
      signal,
    );
    if (result.data)
      setFifoElements((prevFifoElements) => [...prevFifoElements, fifoElement]);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const abortController = new AbortController();
      const resultActions = await fifoService.getAction(abortController.signal);
      if (resultActions.data) {
        setActions(resultActions.data);
      }
      const resultFifoQueue = await fifoService.getFifoQueue(
        abortController.signal,
      );
      if (resultFifoQueue.data) {
        setFifoElements(resultFifoQueue.data);
      }
    };
    const handleOnConnect = () => setIsConnected(true);
    const handleOnFifoRefund = (event: FifoEvent) => {
      setActions(event.payload.actions);
    };
    const handleOnPerformAction = (event: FifoEvent) => {
      const payload: FifoPayloadPerformAction =
        event.payload as FifoPayloadPerformAction;

      setFifoElements(payload.fifoElements);
      setActions(payload.actions);
    };
    loadInitialData();
    socket.on(FifoEventsEnum.REFUND, handleOnFifoRefund);
    socket.on(FifoEventsEnum.PERFORM_ACITON, handleOnPerformAction);
    socket.on('connect', handleOnConnect);
    return () => {
      socket.off(FifoEventsEnum.REFUND, handleOnFifoRefund);
      socket.off(FifoEventsEnum.PERFORM_ACITON, handleOnPerformAction);
      socket.off('connect', handleOnConnect);
    };
  }, []);

  return {
    isConnected,
    actions,
    fifoElements,
    addFifoElement,
  };
};

export default useFifo;
