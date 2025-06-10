import React from 'react';
import Timer from './Timer';

const SmudgeTimer = () => {
  const description = (
    <>
      Demon - 1 minute<br />
      Spirit - 3 minutes<br />
      All other ghosts - 1 minute 30 seconds
    </>
  );

  return (
    <Timer
      initialTime={180} // 3 minutes in seconds
      title="Smudge Timer"
      description={description}
    />
  );
};

export default SmudgeTimer;