import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Send, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { opprimeClient, getVideoUrl, getThumbnailUrl } from '@/lib/opprime-client';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  // Social state
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

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

  const handleComment = async () => {
    if (!userId) { toast.error('Sign in to comment'); return; }
    if (!id || !newComment.trim()) return;
    setSubmittingComment(true);
    const { data, error } = await supabase.from('video_comments').insert({
      video_id: id,
      user_id: userId,
      content: newComment.trim(),
    }).select().single();
    setSubmittingComment(false);
    if (error) { toast.error('Failed to post comment'); return; }
    setComments(prev => [...prev, data]);
    setNewComment('');
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from('video_comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleShare = () => {
    const trailerUrl = (video as any)?.trailer_url;
    const shareUrl = trailerUrl || window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

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
                  className="w-full h-full"
                  poster={getThumbnailUrl(video.thumbnail)}
                />
              </div>
            ) : (
              <div className="aspect-video bg-card rounded-sm flex items-center justify-center gold-border">
                <p className="text-muted-foreground font-mono text-sm">Video unavailable</p>
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

          {/* Right: Social Sidebar (25%) */}
          <div className="lg:w-1/4 lg:min-w-[280px] flex flex-col border border-border rounded-sm bg-card/50">
            {/* Like + Share bar */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                <span className="font-mono text-xs">{likeCount}</span>
              </button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle size={16} />
                <span className="font-mono text-xs">{comments.length}</span>
              </div>
              <button onClick={handleShare} className="text-muted-foreground hover:text-foreground transition-colors">
                <Share2 size={18} />
              </button>
            </div>

            {/* Comments */}
            <div className="flex-1 flex flex-col min-h-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-4 pt-3 pb-2">Comments</p>
              <ScrollArea className="flex-1 max-h-[400px] lg:max-h-[50vh]">
                <div className="px-4 space-y-3 pb-3">
                  {comments.length === 0 && (
                    <p className="text-muted-foreground text-xs font-mono py-4 text-center">No comments yet. Be the first!</p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="group">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-foreground text-sm leading-relaxed break-words flex-1">{c.content}</p>
                        {c.user_id === userId && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground mt-1">
                        {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Comment input */}
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={userId ? "Add a comment..." : "Sign in to comment"}
                    disabled={!userId || submittingComment}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                    className="text-sm"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={!userId || !newComment.trim() || submittingComment}
                    size="icon"
                    variant="ghost"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Watch;
