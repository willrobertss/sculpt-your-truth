import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Film } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilmCard from '@/components/FilmCard';
import { mockCreators, mockFilms } from '@/lib/mock-data';

const CreatorProfile = () => {
  const { slug } = useParams();
  const creator = mockCreators.find((c) => c.slug === slug) || mockCreators[0];
  const creatorFilms = mockFilms.filter((f) => f.creator_slug === creator.slug);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Creator header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            <div className="w-28 h-28 rounded-full overflow-hidden gold-border gold-glow flex-shrink-0">
              <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="font-display text-3xl font-bold text-foreground">{creator.display_name}</h1>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {creator.genre_focus?.map((g) => (
                  <span key={g} className="font-mono text-[10px] uppercase tracking-widest text-primary gold-border px-2 py-0.5 rounded-sm">{g}</span>
                ))}
              </div>
              {creator.bio && (
                <p className="font-body text-sm text-muted-foreground mt-4 max-w-lg">{creator.bio}</p>
              )}
              <div className="flex gap-4 mt-4 justify-center md:justify-start">
                <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <Film size={10} /> {creator.film_count} titles
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <Globe size={10} /> OPPRIME Creator
                </span>
              </div>
            </div>
          </motion.div>

          {/* Creator's films */}
          <h2 className="font-display text-xl font-bold text-foreground mb-6">Films & Shorts</h2>
          {creatorFilms.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {creatorFilms.map((film) => (
                <FilmCard key={film.id} {...film} />
              ))}
            </div>
          ) : (
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
