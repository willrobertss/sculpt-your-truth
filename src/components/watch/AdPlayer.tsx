import { useState, useRef, useEffect } from 'react';

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
  mainVideoRef: React.RefObject<HTMLVideoElement | null>;
  onAllPreRollsDone: () => void;
}

const AdPlayer = ({ ads, mainVideoRef, onAllPreRollsDone }: AdPlayerProps) => {
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const [playingAd, setPlayingAd] = useState<AdData | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [preRollQueue, setPreRollQueue] = useState<AdData[]>([]);
  const [preRollDone, setPreRollDone] = useState(false);
  const [midRollPlayed, setMidRollPlayed] = useState<Set<string>>(new Set());
  const [postRollQueue, setPostRollQueue] = useState<AdData[]>([]);

  const preRolls = ads.filter(a => a.placement === 'pre_roll');
  const midRolls = ads.filter(a => a.placement === 'mid_roll');
  const postRolls = ads.filter(a => a.placement === 'post_roll');

  // Start pre-rolls on mount
  useEffect(() => {
    if (preRolls.length > 0) {
      setPreRollQueue(preRolls);
    } else {
      setPreRollDone(true);
      onAllPreRollsDone();
    }
  }, []);

  // Play next pre-roll from queue
  useEffect(() => {
    if (preRollQueue.length > 0 && !playingAd) {
      const next = preRollQueue[0];
      setPlayingAd(next);
      setPreRollQueue(prev => prev.slice(1));
    } else if (preRollQueue.length === 0 && !playingAd && !preRollDone) {
      setPreRollDone(true);
      onAllPreRollsDone();
    }
  }, [preRollQueue, playingAd, preRollDone]);

  // Mid-roll: listen to main video timeupdate
  useEffect(() => {
    const video = mainVideoRef.current;
    if (!video || midRolls.length === 0) return;

    const handleTimeUpdate = () => {
      if (playingAd) return;
      const currentTime = video.currentTime;
      for (const ad of midRolls) {
        if (ad.trigger_at_seconds && !midRollPlayed.has(ad.id) && currentTime >= ad.trigger_at_seconds) {
          video.pause();
          setPlayingAd(ad);
          setMidRollPlayed(prev => new Set(prev).add(ad.id));
          break;
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [midRolls, playingAd, midRollPlayed]);

  // Post-roll: listen for main video ended
  useEffect(() => {
    const video = mainVideoRef.current;
    if (!video || postRolls.length === 0) return;

    const handleEnded = () => {
      if (postRolls.length > 0) {
        setPostRollQueue(postRolls);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [postRolls]);

  // Play next post-roll
  useEffect(() => {
    if (postRollQueue.length > 0 && !playingAd) {
      const next = postRollQueue[0];
      setPlayingAd(next);
      setPostRollQueue(prev => prev.slice(1));
    }
  }, [postRollQueue, playingAd]);

  // Countdown & skip timer
  useEffect(() => {
    if (!playingAd) { setRemaining(0); setCanSkip(false); return; }
    setRemaining(playingAd.duration_seconds);
    setCanSkip(false);

    const skipTimer = setTimeout(() => setCanSkip(true), 5000);
    const countdownInterval = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => { clearTimeout(skipTimer); clearInterval(countdownInterval); };
  }, [playingAd]);

  const handleAdEnded = () => {
    const wasPreOrMid = playingAd?.placement;
    setPlayingAd(null);
    if (wasPreOrMid === 'mid_roll') {
      mainVideoRef.current?.play();
    }
  };

  const handleSkip = () => {
    handleAdEnded();
  };

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
      {/* Overlay */}
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
