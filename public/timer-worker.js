// Timer Web Worker
let timers = {};

self.onmessage = function(e) {
  const { action, timerId, data } = e.data;

  switch (action) {
    case 'start':
      startTimer(timerId, data);
      break;
    case 'pause':
      pauseTimer(timerId);
      break;
    case 'stop':
      stopTimer(timerId);
      break;
    case 'reset':
      resetTimer(timerId, data);
      break;
    case 'getTime':
      getTime(timerId);
      break;
  }
};

function startTimer(timerId, { initialTime, elapsedTime = 0 }) {
  if (timers[timerId]) {
    clearInterval(timers[timerId].interval);
  }

  const startTime = Date.now();
  timers[timerId] = {
    initialTime,
    elapsedTime,
    startTime,
    interval: setInterval(() => {
      const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
      const totalElapsed = elapsedTime + currentElapsed;
      const timeLeft = Math.max(0, initialTime - totalElapsed);

      self.postMessage({
        timerId,
        timeLeft,
        totalElapsed,
        isFinished: timeLeft === 0
      });

      if (timeLeft === 0) {
        clearInterval(timers[timerId].interval);
        delete timers[timerId];
      }
    }, 1000)
  };

  // Send immediate update
  const timeLeft = Math.max(0, initialTime - elapsedTime);
  self.postMessage({
    timerId,
    timeLeft,
    totalElapsed: elapsedTime,
    isFinished: timeLeft === 0
  });
}

function pauseTimer(timerId) {
  if (timers[timerId]) {
    clearInterval(timers[timerId].interval);
    const currentElapsed = Math.floor((Date.now() - timers[timerId].startTime) / 1000);
    const totalElapsed = timers[timerId].elapsedTime + currentElapsed;
    
    self.postMessage({
      timerId,
      paused: true,
      totalElapsed
    });
    
    delete timers[timerId];
  }
}

function stopTimer(timerId) {
  if (timers[timerId]) {
    clearInterval(timers[timerId].interval);
    delete timers[timerId];
  }
  
  self.postMessage({
    timerId,
    stopped: true
  });
}

function resetTimer(timerId, { initialTime }) {
  if (timers[timerId]) {
    clearInterval(timers[timerId].interval);
    delete timers[timerId];
  }
  
  self.postMessage({
    timerId,
    timeLeft: initialTime,
    totalElapsed: 0,
    reset: true
  });
}

function getTime(timerId) {
  if (timers[timerId]) {
    const currentElapsed = Math.floor((Date.now() - timers[timerId].startTime) / 1000);
    const totalElapsed = timers[timerId].elapsedTime + currentElapsed;
    const timeLeft = Math.max(0, timers[timerId].initialTime - totalElapsed);
    
    self.postMessage({
      timerId,
      timeLeft,
      totalElapsed,
      isFinished: timeLeft === 0
    });
  }
}