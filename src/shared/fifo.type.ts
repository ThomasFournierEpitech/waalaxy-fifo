export enum FifoEventsEnum {
  REFUND = 'refund',
  PERFORM_ACITON = 'performAciton',
}

export type FifoDashboardElement = {
  id: string;
  credit: number;
  maxCredit: number;
};

export type FifoPayloadPerformAction = {
  fifoElements: string[];
  actions: FifoDashboardElement[];
};

export type FifoPayloadRefund = Pick<FifoPayloadPerformAction, 'actions'>;

export type FifoEventPayload = FifoPayloadPerformAction | FifoPayloadRefund;

export type FifoEvent = {
  type: FifoEventsEnum;
  payload: FifoEventPayload;
};

export type Actions = {
  id: string;
  maxCredit: number;
  credit: number;
};
