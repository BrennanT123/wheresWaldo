import { useState, useEffect } from "react";
import axios from "axios";
import { API_LINK } from "./constants";
axios.defaults.withCredentials = true;

export const useFetchCurrentGame = (setLoading, setError) => {
  const [isGameRunning, setIsGameRunning] = useState(null);

  useEffect(() => {
    const checkIfGameIsRunning = async () => {
      setLoading(true);
      setError(null);

     
      try {
        const response = await axios.get(`${API_LINK}/setup`, {
          withCredentials: true,
        });
     
        setIsGameRunning(response.data);
      } catch (err) {
        console.error("error during startup", err);
        const messages =
          err.response?.data?.errors?.map((e) => e.msg).join("\n") ||
          "unexpected error occured";
        setError(messages);
      } finally {
        setLoading(false);
      }
    };
    checkIfGameIsRunning();
  }, []);

  return isGameRunning;
};
