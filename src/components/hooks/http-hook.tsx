import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeHttpRequests = useRef<AbortController[]>([]);

  const sendRequest = useCallback(
    async <T,>(
      url: string,
      method: string = "GET",
      body: BodyInit | null = null,
      headers: HeadersInit = {}
    ): Promise<T> => {
      setIsLoading(true);

      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        //data we send to API:
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal,
        });

        //data we get back from API:
        const responseData: T = await response.json();

        //removing abort controller from array of abort controllers
        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        if (!response.ok) {
          throw new Error((responseData as any).message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        //original catch(err)code:
        // setError(err.message);
        // setIsLoading(false);
        // throw err;

        // fix for "signal is aborted without reason" error
        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
          setIsLoading(false);
          throw err;
        }
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  // useEffect runs when components unmounts and cencel http request
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
