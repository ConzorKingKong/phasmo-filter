import { useRef, useEffect, useCallback } from 'react';

export const useTimerWorker = () => {
  const workerRef = useRef(null);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    // Create the worker
    workerRef.current = new Worker('/timer-worker.js');

    // Handle messages from worker
    workerRef.current.onmessage = (e) => {
      const { timerId, ...data } = e.data;
      const listener = listenersRef.current.get(timerId);
      if (listener) {
        listener(data);
      }
    };

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const startTimer = useCallback((timerId, initialTime, elapsedTime = 0) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        action: 'start',
        timerId,
        data: { initialTime, elapsedTime }
      });
    }
  }, []);

  const pauseTimer = useCallback((timerId) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        action: 'pause',
        timerId
      });
    }
  }, []);

  const stopTimer = useCallback((timerId) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        action: 'stop',
        timerId
      });
    }
  }, []);

  const resetTimer = useCallback((timerId, initialTime) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        action: 'reset',
        timerId,
        data: { initialTime }
      });
    }
  }, []);

  const getTime = useCallback((timerId) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        action: 'getTime',
        timerId
      });
    }
  }, []);

  const addListener = useCallback((timerId, listener) => {
    listenersRef.current.set(timerId, listener);
    return () => {
      listenersRef.current.delete(timerId);
    };
  }, []);

  return {
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    getTime,
    addListener
  };
};