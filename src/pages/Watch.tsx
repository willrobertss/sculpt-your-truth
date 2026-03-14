import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialSpotlight from '@/components/SocialSpotlight';
import AdPlayer from '@/components/watch/AdPlayer';
import { opprimeClient, getVideoUrl, getThumbnailUrl } from '@/lib/opprime-client';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Video {
  id: string;
  title: string;
  synopsis: string | null;
  thumbnail: string | null;
  serie_id: string | null;
  approved: boolean;
}

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [seriesEpisodes, setSeriesEpisodes] = useState<Video[]>([]);
  const [seriesTitle, setSeriesTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  // Ad state
  const [adData, setAdData] = useState<any[]>([]);
  const [adsReady, setAdsReady] = useState(false);
  const [preRollDone, setPreRollDone] = useState(false);

  // Social state
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
  }, []);

  // Fetch video
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    opprimeClient
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setVideo(data as Video);
          const urlPath = (data as any).url || null;
          setVideoUrl(getVideoUrl(urlPath));

          if (data.serie_id) {
            Promise.all([
              opprimeClient.from('videos').select('*').eq('serie_id', data.serie_id).eq('approved', true),
              opprimeClient.from('series').select('title').eq('id', data.serie_id).single(),
            ]).then(([eps, series]) => {
              if (eps.data) setSeriesEpisodes((eps.data as Video[]).filter(e => e.id !== id));
              if (series.data) setSeriesTitle(series.data.title);
            });
          }
        }
        setLoading(false);
      });
  }, [id]);

  // Fetch ads for this video
  useEffect(() => {
    if (!id) { setAdsReady(true); return; }
    supabase
      .from('ad_placements')
      .select('*, ads(*)')
      .eq('video_id', id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = data
            .filter((p: any) => p.ads?.is_active)
            .map((p: any) => ({
              id: p.id,
              video_url: p.ads.video_url,
              title: p.ads.title,
              duration_seconds: p.ads.duration_seconds,
              placement: p.placement,
              trigger_at_seconds: p.trigger_at_seconds,
            }));
          setAdData(mapped);
          if (mapped.some((a: any) => a.placement === 'pre_roll')) {
            setPreRollDone(false);
          } else {
            setPreRollDone(true);
          }
        } else {
          setPreRollDone(true);
        }
        setAdsReady(true);
      });
  }, [id]);

  // Fetch likes & comments
  useEffect(() => {
    if (!id) return;

    // Likes count
    supabase.from('video_likes').select('id', { count: 'exact' }).eq('video_id', id).then(({ count }) => {
      setLikeCount(count || 0);
    });

    // Check if user liked
    if (userId) {
      supabase.from('video_likes').select('id').eq('video_id', id).eq('user_id', userId).then(({ data }) => {
        setLiked(!!(data && data.length > 0));
      });
    }

    // Comments
    supabase
      .from('video_comments')
      .select('*')
      .eq('video_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setComments(data || []);
      });
  }, [id, userId]);

  const handleLike = async () => {
    if (!userId) { toast.error('Sign in to like videos'); return; }
    if (!id) return;

    if (liked) {
      await supabase.from('video_likes').delete().eq('video_id', id).eq('user_id', userId);
      setLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
    } else {
      await supabase.from('video_likes').insert({ video_id: id, user_id: userId });
      setLiked(true);
      setLikeCount(c => c + 1);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from('video_comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const shareUrl = (() => {
    const trailerUrl = (video as any)?.trailer_url;
    return trailerUrl || window.location.href;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Video not found.</p>
          <Link to="/" className="text-primary underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-mono text-xs uppercase tracking-widest">
          <ArrowLeft size={14} /> Back to Library
        </Link>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Player + Info (75%) */}
          <div className="flex-1 lg:w-3/4">
            {videoUrl ? (
              <div className="aspect-video bg-black rounded-sm overflow-hidden gold-border">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  crossOrigin="anonymous"
                  preload="metadata"
                  className="w-full h-full"
                  poster={getThumbnailUrl(video.thumbnail)}
                  onError={() => {
                    console.error('Video failed to load:', videoUrl);
                    setVideoUrl('');
                  }}
                />
              </div>
            ) : (
              <div className="aspect-video bg-card rounded-sm overflow-hidden gold-border relative">
                <img
                  src={getThumbnailUrl(video.thumbnail)}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <p className="text-white font-display text-lg font-semibold">Coming Soon</p>
                  <p className="text-white/60 font-mono text-xs uppercase tracking-wider">This video is being prepared</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{video.title}</h1>
              {seriesTitle && (
                <p className="font-mono text-xs uppercase tracking-widest text-primary mt-1">Series: {seriesTitle}</p>
              )}
              {video.synopsis && (
                <p className="font-body text-muted-foreground mt-4 leading-relaxed">{video.synopsis}</p>
              )}
            </div>

            {/* Series sidebar (below on desktop too if exists) */}
            {seriesEpisodes.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display text-lg font-semibold text-foreground mb-4">More from this Series</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {seriesEpisodes.map((ep) => (
                    <Link
                      key={ep.id}
                      to={`/watch/${ep.id}`}
                      className="flex-shrink-0 w-40 group"
                    >
                      <img
                        src={getThumbnailUrl(ep.thumbnail)}
                        alt={ep.title}
                        className="w-40 h-24 object-cover rounded-sm"
                        loading="lazy"
                      />
                      <p className="font-display text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-1">
                        {ep.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Social Spotlight */}
          <SocialSpotlight
            videoId={id!}
            userId={userId}
            liked={liked}
            likeCount={likeCount}
            comments={comments}
            shareUrl={shareUrl}
            videoTitle={video.title}
            onLikeToggle={handleLike}
            onCommentAdd={(comment) => setComments(prev => [...prev, comment])}
            onCommentDelete={(commentId) => handleDeleteComment(commentId)}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Watch;
