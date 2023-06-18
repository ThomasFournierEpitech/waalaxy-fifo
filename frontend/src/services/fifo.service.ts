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
    signal: AbortSignal,
    setFifoAlerts?: any,
  ): Promise<HttpResponse> => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + '/fifo/actions',
        {
          method: 'Get',
          signal: signal,
        },
      );

      return this.handleResponse(response, setFifoAlerts);
    } catch (error: any) {
      if (error?.name === 'AbortError')
        return { data: undefined, errorMessage: 'Requète annulée' };
      return this.handleFailRequest(setFifoAlerts);
    }
  };
  getFifoQueue = async (
    signal: AbortSignal,
    setFifoAlerts?: any,
  ): Promise<HttpResponse> => {
    try {
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + '/fifo/fifoQueue',
        {
          method: 'Get',
          signal: signal,
        },
      );
      return this.handleResponse(response, setFifoAlerts);
    } catch (error: any) {
      if (error?.name === 'AbortError')
        return { data: undefined, errorMessage: 'Requète annulée' };
      return this.handleFailRequest(setFifoAlerts);
    }
  };
  postFifoQueueElement = async (
    fifoElement: string,
    setFifoAlerts?: any,
    signal?: AbortSignal,
  ): Promise<HttpResponse> => {
    try {
      const data = {
        fifoElement: fifoElement,
      };
      const response = await fetch(
        process.env.REACT_APP_BACKEND_URL + '/fifo/fifoElement',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: signal,
        },
      );

      return this.handleResponse(
        response,
        setFifoAlerts,
        `L'action ${fifoElement} à bien été rajoutée`,
      );
    } catch (error: any) {
      if (error?.name === 'AbortError')
        return { data: undefined, errorMessage: 'Requète annulée' };
      return this.handleFailRequest(setFifoAlerts);
    }
  };
}

const fifoService = new FifoService();
export default fifoService;
