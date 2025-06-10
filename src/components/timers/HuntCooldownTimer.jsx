import React from 'react';
import Timer from './Timer';

const HuntCooldownTimer = () => {
  const description = (
    <>
      Demon - 20 seconds<br />
      All other ghosts - 25 seconds
    </>
  );

  return (
    <Timer
      initialTime={25} // 25 seconds
      title="Hunt Cooldown"
      description={description}
    />
  );
};

export default HuntCooldownTimer;