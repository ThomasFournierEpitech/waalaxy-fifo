import fifoService from '../fifo.service';

describe('Service getAction', () => {
  let abortController: AbortController;
  let originalFetch: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>;

  beforeEach(() => {
    abortController = new AbortController();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should fetch actions successfully', async () => {
    const mockResponse = ['A'];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const setFifoAlerts = jest.fn();
    const httpResponse = await fifoService.getAction(
      abortController.signal,
      setFifoAlerts,
    );
    expect(fetch).toHaveBeenCalledWith(
      process.env.REACT_APP_BACKEND_URL + '/fifo/actions',
      {
        method: 'Get',
        signal: abortController.signal,
      },
    );
    expect(httpResponse).toEqual({
      data: mockResponse,
      errorMessage: undefined,
    });
    expect(setFifoAlerts).toHaveBeenCalled();
  });

  it('should handle failed action', async () => {
    let mockResponse = {
      data: undefined,
      errorMessage: "Une erreur s'est produite",
    };
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const setFifoAlerts = jest.fn();
    const httpResponse = await fifoService.getAction(
      abortController.signal,
      setFifoAlerts,
    );

    expect(fetch).toHaveBeenCalledWith(
      process.env.REACT_APP_BACKEND_URL + '/fifo/actions',
      {
        method: 'Get',
        signal: abortController.signal,
      },
    );
    expect(httpResponse).toEqual(mockResponse);
    expect(setFifoAlerts).toHaveBeenCalled();
  });

  it('should return correct cancel message on fetch signal abort', async () => {
    const setFifoAlerts = jest.fn();
    const httpResponsePromise = fifoService.getAction(
      abortController.signal,
      setFifoAlerts,
    );

    abortController.abort();

    const httpResponse = await httpResponsePromise;

    expect(httpResponse).toEqual({
      data: undefined,
      errorMessage: 'Requète annulée',
    });
    expect(setFifoAlerts).not.toHaveBeenCalled();
  });
});

describe('Service getFifoQueue', () => {
  let abortController: AbortController;
  let originalFetch: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>;

  beforeEach(() => {
    abortController = new AbortController();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should fetch fifoQueue successfully', async () => {
    const mockResponse = [
      { id: 'A', maxCredit: 20, credit: 20 },
      { id: 'B', maxCredit: 20, credit: 20 },
      { id: 'C', maxCredit: 30, credit: 30 },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const setFifoAlerts = jest.fn();
    const httpResponse = await fifoService.getFifoQueue(
      abortController.signal,
      setFifoAlerts,
    );
    expect(fetch).toHaveBeenCalledWith(
      process.env.REACT_APP_BACKEND_URL + '/fifo/fifoQueue',
      {
        method: 'Get',
        signal: abortController.signal,
      },
    );
    expect(httpResponse).toEqual({
      data: mockResponse,
      errorMessage: undefined,
    });
    expect(setFifoAlerts).toHaveBeenCalled();
  });

  it('should handle failed fifoQueue', async () => {
    let mockResponse = {
      data: undefined,
      errorMessage: "Une erreur s'est produite",
    };
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const setFifoAlerts = jest.fn();
    const httpResponse = await fifoService.getFifoQueue(
      abortController.signal,
      setFifoAlerts,
    );

    expect(fetch).toHaveBeenCalledWith(
      process.env.REACT_APP_BACKEND_URL + '/fifo/fifoQueue',
      {
        method: 'Get',
        signal: abortController.signal,
      },
    );
    expect(httpResponse).toEqual(mockResponse);
    expect(setFifoAlerts).toHaveBeenCalled();
  });

  it('should return correct cancel message on fetch signal abort', async () => {
    const setFifoAlerts = jest.fn();
    const httpResponsePromise = fifoService.getFifoQueue(
      abortController.signal,
      setFifoAlerts,
    );

    abortController.abort();

    const httpResponse = await httpResponsePromise;

    expect(httpResponse).toEqual({
      data: undefined,
      errorMessage: 'Requète annulée',
    });
    expect(setFifoAlerts).not.toHaveBeenCalled();
  });
});

describe('Service postFifoQueueElement', () => {
  let abortController: AbortController;
  let originalFetch: (
    input: RequestInfo | URL,
    init?: RequestInit | undefined,
  ) => Promise<Response>;

  beforeEach(() => {
    abortController = new AbortController();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should fetch fifoQueue successfully', async () => {
    const mockResponse = ['A'];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    const setFifoAlerts = jest.fn();
    const httpResponse = await fifoService.postFifoQueueElement(
      mockResponse[0],
      setFifoAlerts,
    );
    expect(fetch).toHaveBeenCalledWith(
      process.env.REACT_APP_BACKEND_URL + '/fifo/fifoElement',
      {
        method: 'POST',
        body: '{"fifoElement":"A"}',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: undefined,
      },
    );
    expect(httpResponse).toEqual({
      data: mockResponse,
      errorMessage: undefined,
    });
    expect(setFifoAlerts).toHaveBeenCalled();
  });

  it('should handle failed fifoQueue', async () => {
    let mockResponse = {
      data: undefined,
      errorMessage: "Une erreur s'est produite",
    };
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const setFifoAlerts = jest.fn();
    const httpResponse = await fifoService.postFifoQueueElement(
      'A',
      setFifoAlerts,
    );

    expect(fetch).toHaveBeenCalledWith(
      process.env.REACT_APP_BACKEND_URL + '/fifo/fifoElement',
      {
        method: 'POST',
        body: '{"fifoElement":"A"}',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: undefined,
      },
    );
    expect(httpResponse).toEqual(mockResponse);
    expect(setFifoAlerts).toHaveBeenCalled();
  });

  it('should return correct cancel message on fetch signal abort', async () => {
    const setFifoAlerts = jest.fn();
    const mockResponse = ['A'];
    const httpResponsePromise = fifoService.postFifoQueueElement(
      mockResponse[0],
      setFifoAlerts,
      abortController.signal,
    );

    abortController.abort();

    const httpResponse = await httpResponsePromise;

    expect(httpResponse).toEqual({
      data: undefined,
      errorMessage: 'Requète annulée',
    });
    expect(setFifoAlerts).not.toHaveBeenCalled();
  });
});
