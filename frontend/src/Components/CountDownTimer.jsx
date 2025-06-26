import { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Set to next midnight
      
      const diff = midnight - now;
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Then update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card bg-base-200 shadow-lg border border-base-300">
      <div className="card-body p-4">
        <h2 className="card-title text-sm opacity-70 text-center">POTD Countdown</h2>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-3xl">
                <span style={{ "--value": timeLeft.hours }}></span>
              </span>
              <span className="text-xs opacity-50">hours</span>
            </div>
            <span className="font-mono text-3xl">:</span>
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-3xl">
                <span style={{ "--value": timeLeft.minutes }}></span>
              </span>
              <span className="text-xs opacity-50">minutes</span>
            </div>
            <span className="font-mono text-3xl">:</span>
            <div className="flex flex-col items-center">
              <span className="countdown font-mono text-3xl">
                <span style={{ "--value": timeLeft.seconds }}></span>
              </span>
              <span className="text-xs opacity-50">seconds</span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs opacity-50">Expires at midnight</div>
      </div>
    </div>
  );
};

export default CountdownTimer;