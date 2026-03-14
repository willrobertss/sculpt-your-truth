import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Calendar, Eye, ArrowLeft, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilmCard from '@/components/FilmCard';
import GoldButton from '@/components/GoldButton';
import SocialSpotlight from '@/components/SocialSpotlight';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FilmDetail = () => {
  const { id } = useParams();
  const [film, setFilm] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [creatorName, setCreatorName] = useState('');
  const [creatorSlug, setCreatorSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

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

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('films').select('*').eq('id', id).single();
      if (data) {
        setFilm(data);
        const { data: profile } = await supabase.from('profiles').select('display_name, slug').eq('user_id', data.creator_id).single();
        if (profile) {
          setCreatorName(profile.display_name || 'Unknown');
          setCreatorSlug(profile.slug || '');
        }
        const { data: rel } = await supabase.from('films').select('id, title, genre, poster_url, release_year, duration_minutes').eq('status', 'live').neq('id', data.id).limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // Fetch likes & comments for this film
  useEffect(() => {
    if (!id) return;
    supabase.from('video_likes').select('id', { count: 'exact' }).eq('video_id', id).then(({ count }) => {
      setLikeCount(count || 0);
    });
    if (userId) {
      supabase.from('video_likes').select('id').eq('video_id', id).eq('user_id', userId).then(({ data }) => {
        setLiked(!!(data && data.length > 0));
      });
    }
    supabase.from('video_comments').select('*').eq('video_id', id).order('created_at', { ascending: true }).then(({ data }) => {
      setComments(data || []);
    });
  }, [id, userId]);

  const handleLike = async () => {
    if (!userId) { toast.error('Sign in to like'); return; }
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

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground font-mono text-sm">Loading...</p>
    </div>
  );

  if (!film) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 text-center">
        <h1 className="font-display text-2xl text-foreground">Film not found</h1>
        <Link to="/browse" className="text-primary font-mono text-xs uppercase tracking-widest mt-4 inline-block">← Browse Library</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Video player modal */}
      {showPlayer && film.video_url && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4">
          <button onClick={() => setShowPlayer(false)} className="absolute top-6 right-6 text-foreground hover:text-primary z-10">
            <X size={28} />
          </button>
          <video
            src={film.video_url}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] rounded-sm"
          />
        </div>
      )}

      <section className="relative h-[70vh] overflow-hidden vignette">
        <img src={film.banner_url || film.poster_url || ''} alt={film.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        <div className="relative z-10 container mx-auto px-6 h-full flex items-end pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <Link to="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-mono text-xs uppercase tracking-widest">
              <ArrowLeft size={14} /> Back to Browse
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">{film.title}</h1>
            {film.tagline && <p className="font-body text-lg text-muted-foreground italic mb-4">{film.tagline}</p>}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {(film.genre || []).map((g: string) => (
                <span key={g} className="font-mono text-[10px] uppercase tracking-widest text-primary gold-border px-2 py-1 rounded-sm">{g}</span>
              ))}
              {film.duration_minutes && <span className="flex items-center gap-1 text-muted-foreground font-mono text-[10px]"><Clock size={10} /> {film.duration_minutes}m</span>}
              {film.release_year && <span className="flex items-center gap-1 text-muted-foreground font-mono text-[10px]"><Calendar size={10} /> {film.release_year}</span>}
              <span className="flex items-center gap-1 text-muted-foreground font-mono text-[10px]"><Eye size={10} /> {(film.view_count || 0).toLocaleString()} views</span>
            </div>
            <div className="flex gap-3">
              {film.video_url ? (
                <GoldButton size="lg" onClick={() => setShowPlayer(true)}>
                  <Play size={16} fill="currentColor" className="mr-2" /> Watch Now
                </GoldButton>
              ) : (
                <GoldButton size="lg" disabled>
                  <Play size={16} fill="currentColor" className="mr-2" /> Coming Soon
                </GoldButton>
              )}
              <GoldButton size="lg" variant="outline">+ Watchlist</GoldButton>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Synopsis</h2>
              <p className="font-body text-muted-foreground leading-relaxed">{film.synopsis || film.tagline || 'No synopsis available.'}</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Credits</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Creator</span>
                  <Link to={`/creators/${creatorSlug}`} className="block text-sm text-foreground hover:text-primary transition-colors">{creatorName}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-12 bg-noir-light">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-6">You May Also Like</h2>
            <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4">
              {related.map((f) => (
                <FilmCard key={f.id} id={f.id} title={f.title} genre={f.genre || []} poster_url={f.poster_url || ''} release_year={f.release_year} duration_minutes={f.duration_minutes} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default FilmDetail;
