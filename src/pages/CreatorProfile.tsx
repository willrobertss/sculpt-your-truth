import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Film, Tv, Smartphone, MapPin, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilmCard from '@/components/FilmCard';
import ShortCard from '@/components/ShortCard';
import { supabase } from '@/integrations/supabase/client';

const CreatorProfile = () => {
  const { slug } = useParams();
  const [creator, setCreator] = useState<any>(null);
  const [films, setFilms] = useState<any[]>([]);
  const [shorts, setShorts] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('slug', slug).single();
      if (profile) {
        setCreator(profile);
        const [filmsRes, shortsRes, verticalsRes] = await Promise.all([
          supabase.from('films').select('id, title, genre, poster_url, release_year, duration_minutes').eq('creator_id', profile.user_id).eq('status', 'live'),
          supabase.from('shorts').select('id, title, genre, thumbnail_url, duration_seconds').eq('creator_id', profile.user_id).eq('status', 'live'),
          supabase.from('verticals').select('id, title, genre, thumbnail_url, duration_seconds').eq('creator_id', profile.user_id).eq('status', 'live'),
        ]);
        setFilms(filmsRes.data || []);
        setShorts(shortsRes.data || []);
        setVerticals(verticalsRes.data || []);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground font-mono text-sm">Loading...</p>
    </div>
  );

  if (!creator) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 text-center">
        <h1 className="font-display text-2xl text-foreground">Creator not found</h1>
      </div>
      <Footer />
    </div>
  );

  const totalContent = films.length + shorts.length + verticals.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            <div className="w-28 h-28 rounded-full overflow-hidden gold-border gold-glow flex-shrink-0">
              <img src={creator.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'} alt={creator.display_name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="font-display text-3xl font-bold text-foreground">{creator.display_name}</h1>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {(creator.genre_focus || []).map((g: string) => (
                  <span key={g} className="font-mono text-[10px] uppercase tracking-widest text-primary gold-border px-2 py-0.5 rounded-sm">{g}</span>
                ))}
              </div>
              {creator.bio && <p className="font-body text-sm text-muted-foreground mt-4 max-w-lg">{creator.bio}</p>}
              <div className="flex gap-4 mt-4 justify-center md:justify-start flex-wrap">
                {creator.location && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <MapPin size={10} /> {creator.location}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <Film size={10} /> {totalContent} titles
                </span>
                {creator.website && (
                  <a href={creator.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-mono text-[10px] text-primary hover:underline">
                    <ExternalLink size={10} /> Website
                  </a>
                )}
                <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <Globe size={10} /> OPPRIME Creator
                </span>
              </div>
            </div>
          </motion.div>

          {/* Films */}
          {films.length > 0 && (
            <>
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2"><Film size={18} /> Films</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-12">
                {films.map((film) => (
                  <FilmCard key={film.id} id={film.id} title={film.title} genre={film.genre || []} poster_url={film.poster_url || ''} release_year={film.release_year} duration_minutes={film.duration_minutes} />
                ))}
              </div>
            </>
          )}

          {/* Shorts */}
          {shorts.length > 0 && (
            <>
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2"><Tv size={18} /> Shorts</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-12">
                {shorts.map((s) => (
                  <ShortCard key={s.id} id={s.id} title={s.title} thumbnail_url={s.thumbnail_url || ''} genre={s.genre || []} duration_seconds={s.duration_seconds} />
                ))}
              </div>
            </>
          )}

          {/* Verticals */}
          {verticals.length > 0 && (
            <>
              <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2"><Smartphone size={18} /> Verticals</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mb-12">
                {verticals.map((v) => (
                  <ShortCard key={v.id} id={v.id} title={v.title} thumbnail_url={v.thumbnail_url || ''} genre={v.genre || []} duration_seconds={v.duration_seconds} />
                ))}
              </div>
            </>
          )}

          {totalContent === 0 && (
            <div className="bg-card gold-border rounded-sm p-8 text-center">
              <p className="text-muted-foreground font-body">No published content yet.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatorProfile;
