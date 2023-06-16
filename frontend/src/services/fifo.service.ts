export interface HttpResponse {
  data: any;
  errorMessage: string | undefined;
}

class FifoService {
  private handleResponse = async (
    response: Response,
    setFifoAlerts: any,
    successMessage?: string,
  ): Promise<HttpResponse> => {
    const result = await response.json();

    if (response.ok) {
      if (setFifoAlerts !== undefined)
        setFifoAlerts((prevInfosUx: any) => [
          ...prevInfosUx,
          {
            message: successMessage,
            type: 'success',
          },
        ]);
      return { data: result, errorMessage: undefined };
    } else {
      const errorMessage = result.message;
      if (setFifoAlerts !== undefined)
        setFifoAlerts((prevInfosUx: any) => [
          ...prevInfosUx,
          {
            message: errorMessage,
            type: 'danger',
          },
        ]);

      return { data: undefined, errorMessage: errorMessage };
    }
  };

  private handleFailRequest = async (setFifoAlerts?: any) => {
    const errorMessage = "Une erreur s'est produite";
    if (setFifoAlerts)
      setFifoAlerts((prevInfosUx: any) => [
        ...prevInfosUx,
        {
          message: "Une erreur s'est produite",
          type: 'danger',
        },
      ]);
    return { data: undefined, errorMessage: errorMessage };
  };

  getAction = async (
    abordController: AbortController,
    setFifoAlerts?: any,
  ): Promise<HttpResponse> => {
    try {
      const response = await fetch('http://localhost:3001/fifo/actions', {
        method: 'Get',
        signal: abordController.signal,
      });
      return this.handleResponse(response, setFifoAlerts);
    } catch (_) {
      return this.handleFailRequest(setFifoAlerts);
    }
  };
  getFifoQueue = async (
    abordController: AbortController,
    setFifoAlerts?: any,
  ): Promise<HttpResponse> => {
    try {
      const response = await fetch('http://localhost:3001/fifo/fifoQueue', {
        method: 'Get',
        signal: abordController.signal,
      });
      return this.handleResponse(response, setFifoAlerts);
    } catch (_) {
      return this.handleFailRequest(setFifoAlerts);
    }
  };
  postFifoQueueElement = async (
    fifoElement: string,
    setFifoAlerts?: any,
  ): Promise<HttpResponse> => {
    try {
      const data = {
        fifoElement: fifoElement,
      };
      const response = await fetch('http://localhost:3001/fifo/fifoElement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return this.handleResponse(
        response,
        setFifoAlerts,
        `L'action ${fifoElement} à bien été rajoutée`,
      );
    } catch (_) {
      return this.handleFailRequest(setFifoAlerts);
    }
  };
}

const fifoService = new FifoService();
export default fifoService;
