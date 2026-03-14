import { useState, useRef, useEffect, useCallback } from 'react';

interface AdData {
  id: string;
  video_url: string;
  title: string;
  duration_seconds: number;
  placement: 'pre_roll' | 'mid_roll' | 'post_roll';
  trigger_at_seconds: number | null;
}

interface AdPlayerProps {
  ads: AdData[];
  mainVideoRef?: React.RefObject<HTMLVideoElement | null>;
  onAllPreRollsDone: () => void;
  onMidRollDone?: () => void;
  onPostRollDone?: () => void;
  mode: 'pre_roll' | 'mid_roll' | 'post_roll';
}

const AdPlayer = ({ ads, mainVideoRef, onAllPreRollsDone, onMidRollDone, onPostRollDone, mode }: AdPlayerProps) => {
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const [queue, setQueue] = useState<AdData[]>([]);
  const [playingAd, setPlayingAd] = useState<AdData | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Build queue on mount based on mode
  useEffect(() => {
    const filtered = ads.filter(a => a.placement === mode);
    if (filtered.length > 0) {
      setQueue(filtered);
    } else {
      // No ads for this mode, immediately signal done
      if (mode === 'pre_roll') onAllPreRollsDone();
      if (mode === 'mid_roll') onMidRollDone?.();
      if (mode === 'post_roll') onPostRollDone?.();
    }
    setInitialized(true);
  }, []);

  // Play next from queue
  useEffect(() => {
    if (!initialized) return;
    if (queue.length > 0 && !playingAd) {
      const [next, ...rest] = queue;
      setPlayingAd(next);
      setQueue(rest);
    } else if (queue.length === 0 && !playingAd && initialized) {
      // All ads in this mode are done
      if (mode === 'pre_roll') onAllPreRollsDone();
      if (mode === 'mid_roll') onMidRollDone?.();
      if (mode === 'post_roll') onPostRollDone?.();
    }
  }, [queue, playingAd, initialized]);

  // Countdown using ad video timeupdate
  useEffect(() => {
    if (!playingAd) { setRemaining(0); setCanSkip(false); return; }
    setRemaining(playingAd.duration_seconds);
    setCanSkip(false);

    const skipTimer = setTimeout(() => setCanSkip(true), 5000);

    const adVideo = adVideoRef.current;
    const handleTimeUpdate = () => {
      if (adVideo) {
        const left = Math.max(0, Math.ceil((adVideo.duration || playingAd.duration_seconds) - adVideo.currentTime));
        setRemaining(left);
      }
    };

    adVideo?.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      clearTimeout(skipTimer);
      adVideo?.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [playingAd]);

  const handleAdEnded = useCallback(() => {
    setPlayingAd(null);
  }, []);

  const handleSkip = useCallback(() => {
    handleAdEnded();
  }, [handleAdEnded]);

  if (!playingAd) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black">
      <video
        ref={adVideoRef}
        src={playingAd.video_url}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        onEnded={handleAdEnded}
        onError={handleAdEnded}
      />
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded font-mono text-xs text-white uppercase tracking-wider">
        Ad · {remaining}s remaining
      </div>
      {canSkip && (
        <button
          onClick={handleSkip}
          className="absolute bottom-6 right-6 bg-white text-black px-4 py-2 font-heading text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
        >
          Skip Ad →
        </button>
      )}
    </div>
  );
};

export default AdPlayer;
