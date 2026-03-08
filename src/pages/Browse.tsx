import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3X3, List } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilmCard from '@/components/FilmCard';
import { Input } from '@/components/ui/input';
import { mockFilms, genres } from '@/lib/mock-data';

const Browse = () => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return mockFilms.filter((f) => {
      const matchSearch = !search || f.title.toLowerCase().includes(search.toLowerCase());
      const matchGenre = !selectedGenre || f.genre.includes(selectedGenre);
      return matchSearch && matchGenre;
    });
  }, [search, selectedGenre]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Browse Library</h1>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">
              {filtered.length} titles available
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search films..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface border-border h-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedGenre(null)}
                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors ${
                  !selectedGenre ? 'bg-primary text-primary-foreground' : 'gold-border text-muted-foreground hover:text-primary'
                }`}
              >
                All
              </button>
              {genres.slice(0, 8).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g === selectedGenre ? null : g)}
                  className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors ${
                    selectedGenre === g ? 'bg-primary text-primary-foreground' : 'gold-border text-muted-foreground hover:text-primary'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-sm ${viewMode === 'grid' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-sm ${viewMode === 'list' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Grid */}
          <motion.div
            layout
            className={viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5'
              : 'flex flex-col gap-3'
            }
          >
            {filtered.map((film, i) => (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {viewMode === 'grid' ? (
                  <FilmCard {...film} />
                ) : (
                  <div className="flex gap-4 items-center bg-card gold-border rounded-sm p-3 hover:bg-surface-hover transition-colors">
                    <img src={film.poster_url} alt={film.title} className="w-12 h-18 object-cover rounded-sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm font-semibold text-foreground truncate">{film.title}</h3>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        {film.genre.join(' · ')} · {film.release_year}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{film.duration_minutes}m</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-display text-lg text-muted-foreground">No films found</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
