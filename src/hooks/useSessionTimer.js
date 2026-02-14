import { useState, useEffect, useRef } from 'react';

// [ROLE: The Stopwatch]
// This tool (hook) counts how long you have been logged in.
// It takes a `startTime` and returns a formatted string like "05:30".
export const useSessionTimer = (startTime) => {
  // 1. STATE: Keep track of total seconds passed
  const [duration, setDuration] = useState(0);
  
  // 2. REF: A reference to the interval timer so we can stop it later
  const timerRef = useRef(null);

  // 3. EFFECT: Start the countdown when `startTime` changes
  useEffect(() => {
    // If no start time given, do nothing
    if (!startTime) return;

    // Helper function to calculate seconds passed since startTime
    const updateTimer = () => {
      const now = Date.now(); // Current time in milliseconds
      const diffInSeconds = Math.floor((now - startTime) / 1000); // Convert ms to seconds
      setDuration(diffInSeconds); // Update state
    };

    // Run immediately once so we don't wait 1 second for first update
    updateTimer();

    // Start a timer that runs `updateTimer` every 1000ms (1 second)
    timerRef.current = setInterval(updateTimer, 1000);

    // CLEANUP: When this component is destroyed (user leaves), stop the timer
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]); // Run this effect ONLY when startTime changes

  // Helper to turn 65 seconds into "01:05"
  const formatTime = (totalSeconds) => {
    // Ensure we don't have negative time
    if (totalSeconds < 0) totalSeconds = 0;
    
    const minutes = Math.floor(totalSeconds / 60); // e.g. 65 / 60 = 1
    const seconds = totalSeconds % 60; // e.g. 65 % 60 = 5
    // .padStart ensures "5" becomes "05"
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return { duration, formattedDuration: formatTime(duration) };
};
