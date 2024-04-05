import React, { useEffect, useState, useRef } from 'react';

export default function Timer(props) {
  const [countdown, setCountdown] = useState(60);
  const timerId = useRef();

  useEffect(() => {
    timerId.current = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      clearInterval(timerId.current);
    };
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      clearInterval(timerId.current);
      props.timerStatus(true);
    }
  }, [countdown]);

  return (
    <div className="timer" style={{ display: countdown === 0 ? 'none' : '' }}>
      {countdown >= 0 ? <p>{countdown}</p> : null}
    </div>
  );
}