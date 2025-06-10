import React from 'react';
import { useApp } from '../../context/AppContext';
import WorkerTimer from './WorkerTimer';

const HuntCooldownTimer = () => {
  const { huntCooldownTimer, setHuntCooldownTimer, timerWorker } = useApp();
  
  const description = (
    <>
      Demon - 20 seconds<br />
      All other ghosts - 25 seconds
    </>
  );

  return (
    <WorkerTimer
      timerId="huntCooldown"
      timerState={huntCooldownTimer}
      setTimerState={setHuntCooldownTimer}
      timerWorker={timerWorker}
      initialTime={25} // 25 seconds
      title="Hunt Cooldown"
      description={description}
    />
  );
};

export default HuntCooldownTimer;