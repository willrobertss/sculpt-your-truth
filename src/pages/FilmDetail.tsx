import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Calendar, Eye, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilmCard from '@/components/FilmCard';
import GoldButton from '@/components/GoldButton';
import { mockFilms } from '@/lib/mock-data';

const FilmDetail = () => {
  const { id } = useParams();
  const film = mockFilms.find((f) => f.id === id) || mockFilms[0];
  const related = mockFilms.filter((f) => f.id !== film.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero banner */}
      <section className="relative h-[70vh] overflow-hidden vignette">
        <img src={film.banner_url} alt={film.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        <div className="relative z-10 container mx-auto px-6 h-full flex items-end pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <Link to="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-mono text-xs uppercase tracking-widest">
              <ArrowLeft size={14} /> Back to Browse
            </Link>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">{film.title}</h1>
            {film.tagline && (
              <p className="font-body text-lg text-muted-foreground italic mb-4">{film.tagline}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {film.genre.map((g) => (
                <span key={g} className="font-mono text-[10px] uppercase tracking-widest text-primary gold-border px-2 py-1 rounded-sm">{g}</span>
              ))}
              <span className="flex items-center gap-1 text-muted-foreground font-mono text-[10px]">
                <Clock size={10} /> {film.duration_minutes}m
              </span>
              <span className="flex items-center gap-1 text-muted-foreground font-mono text-[10px]">
                <Calendar size={10} /> {film.release_year}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground font-mono text-[10px]">
                <Eye size={10} /> {film.view_count?.toLocaleString()} views
              </span>
            </div>
            <div className="flex gap-3">
              <GoldButton size="lg">
                <Play size={16} fill="currentColor" className="mr-2" /> Watch Now
              </GoldButton>
              <GoldButton size="lg" variant="outline">+ Watchlist</GoldButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Details */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Synopsis</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                {film.tagline} In a world where truth is subjective and memory is unreliable, one filmmaker's vision cuts through the noise to deliver a story that stays with you long after the credits roll. This is independent cinema at its most powerful — raw, honest, and unforgettable.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Credits</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Director</span>
                  <p className="text-sm text-foreground">{film.creator_name}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Creator</span>
                  <Link to={`/creators/${film.creator_slug}`} className="block text-sm text-foreground hover:text-primary transition-colors">
                    {film.creator_name}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="py-12 bg-noir-light">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-xl font-bold text-foreground mb-6">You May Also Like</h2>
          <div className="flex gap-5 overflow-x-auto hide-scrollbar pb-4">
            {related.map((f) => (
              <FilmCard key={f.id} {...f} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FilmDetail;
