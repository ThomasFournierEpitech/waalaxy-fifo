import { useState } from 'react';

export interface FifoAlert {
  message: string;
  type: 'danger' | 'success';
}

export const useFifoAlert = () => {
  const [fifoAlerts, setFifoAlerts] = useState<FifoAlert[]>([]);

  const dismissFifoAlert = (indexToDismiss: number) => {
    setFifoAlerts((prevFifoAlerts) =>
      prevFifoAlerts.filter((_, index) => index !== indexToDismiss),
    );
  };

  return {
    fifoAlerts,
    dismissFifoAlert,
    setFifoAlerts,
  };
};

export default useFifoAlert;
