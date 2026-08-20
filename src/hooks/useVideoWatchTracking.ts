import { useCallback, useEffect, useRef, useState } from "react";

export function useVideoWatchTracking({
  videoId,
  onWatchDelta,
  onComplete,
}: {
  videoId: number;
  onWatchDelta: (watchedSecondsDelta: number) => Promise<void>;
  onComplete: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pendingWatchSecondsRef = useRef(0);
  const lastObservedVideoTimeRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);
  const isFlushingRef = useRef(false);
  const [isWatchThresholdMet, setIsWatchThresholdMet] = useState(false);

  useEffect(() => {
    setIsWatchThresholdMet(false);
    pendingWatchSecondsRef.current = 0;
    lastObservedVideoTimeRef.current = null;
  }, [videoId]);

  const collectPlayedVideoSeconds = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentVideoTime = Number(video.currentTime || 0);
    const previousVideoTime = lastObservedVideoTimeRef.current;

    if (video.duration > 0 && currentVideoTime / video.duration >= 0.9) {
      setIsWatchThresholdMet(true);
    }

    if (previousVideoTime != null && !video.paused && !video.ended && !isSeekingRef.current) {
      const delta = currentVideoTime - previousVideoTime;
      if (delta > 0) {
        pendingWatchSecondsRef.current += delta;
      }
    }

    lastObservedVideoTimeRef.current = currentVideoTime;
  }, []);

  const flushWatchTime = useCallback(
    async (force: boolean) => {
      if (isFlushingRef.current) return;

      const roundedSeconds = Math.floor(pendingWatchSecondsRef.current);
      const minimumFlushSeconds = force ? 1 : 10;
      if (roundedSeconds < minimumFlushSeconds) return;

      isFlushingRef.current = true;
      pendingWatchSecondsRef.current -= roundedSeconds;
      try {
        await onWatchDelta(roundedSeconds);
      } catch {
        // Restore pending seconds so a later flush can retry.
        pendingWatchSecondsRef.current += roundedSeconds;
      } finally {
        isFlushingRef.current = false;
      }
    },
    [onWatchDelta],
  );

  const pauseTracking = useCallback(() => {
    collectPlayedVideoSeconds();
    lastObservedVideoTimeRef.current = videoRef.current?.currentTime ?? null;
  }, [collectPlayedVideoSeconds]);

  const startTracking = useCallback(() => {
    lastObservedVideoTimeRef.current = videoRef.current?.currentTime ?? 0;
  }, []);

  const startSeeking = useCallback(() => {
    pauseTracking();
    isSeekingRef.current = true;
  }, [pauseTracking]);

  const finishSeeking = useCallback(() => {
    isSeekingRef.current = false;
    lastObservedVideoTimeRef.current = videoRef.current?.currentTime ?? 0;
  }, []);

  const handleEnded = useCallback(() => {
    pauseTracking();
    void flushWatchTime(true);
    onComplete();
  }, [flushWatchTime, onComplete, pauseTracking]);

  useEffect(() => {
    const flushInterval = window.setInterval(() => {
      collectPlayedVideoSeconds();
      void flushWatchTime(false);
    }, 5000);

    return () => {
      pauseTracking();
      void flushWatchTime(true);
      window.clearInterval(flushInterval);
    };
  }, [collectPlayedVideoSeconds, flushWatchTime, pauseTracking]);

  return {
    videoRef,
    isWatchThresholdMet,
    videoHandlers: {
      onTimeUpdate: collectPlayedVideoSeconds,
      onPlay: startTracking,
      onPause: pauseTracking,
      onWaiting: pauseTracking,
      onSeeking: startSeeking,
      onSeeked: finishSeeking,
      onEnded: handleEnded,
    },
  };
}
