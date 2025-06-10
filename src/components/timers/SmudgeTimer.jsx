import React from 'react';
import { useApp } from '../../context/AppContext';
import WorkerTimer from './WorkerTimer';

const SmudgeTimer = () => {
  const { smudgeTimer, setSmudgeTimer, timerWorker } = useApp();
  
  const description = (
    <>
      Demon - 1 minute<br />
      Spirit - 3 minutes<br />
      All other ghosts - 1 minute 30 seconds
    </>
  );

  return (
    <WorkerTimer
      timerId="smudge"
      timerState={smudgeTimer}
      setTimerState={setSmudgeTimer}
      timerWorker={timerWorker}
      initialTime={180} // 3 minutes in seconds
      title="Smudge Timer"
      description={description}
    />
  );
};

export default SmudgeTimer;