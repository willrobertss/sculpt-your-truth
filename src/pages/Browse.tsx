import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Grid3X3, List } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoHoverCard from '@/components/VideoHoverCard';
import { Input } from '@/components/ui/input';
import { opprimeClient, getThumbnailUrl } from '@/lib/opprime-client';

interface OPGenre {
  id: string;
  name: string;
}

const Browse = () => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [videos, setVideos] = useState<any[]>([]);
  const [genres, setGenres] = useState<OPGenre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      opprimeClient.from('videos').select('*'),
      opprimeClient.from('genres').select('*'),
    ]).then(([vRes, gRes]) => {
      setVideos(vRes.data || []);
      setGenres(gRes.data || []);
      setLoading(false);
    });
  }, []);

  const genreMap = useMemo(() => {
    const m: Record<string, string> = {};
    genres.forEach((g) => (m[g.id] = g.name));
    return m;
  }, [genres]);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchSearch = !search || v.title?.toLowerCase().includes(search.toLowerCase());
      const matchGenre = !selectedGenre || v.genre_id === selectedGenre;
      return matchSearch && matchGenre;
    });
  }, [search, selectedGenre, videos]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Browse Library</h1>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">
              {loading ? '...' : `${filtered.length} titles available`}
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
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
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g.id === selectedGenre ? null : g.id)}
                  className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm transition-colors ${
                    selectedGenre === g.id ? 'bg-primary text-primary-foreground' : 'gold-border text-muted-foreground hover:text-primary'
                  }`}
                >
                  {g.name}
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
            {filtered.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {viewMode === 'grid' ? (
                  <VideoHoverCard
                    id={video.id}
                    title={video.title}
                    thumbnail={video.thumbnail}
                    poster_url={video.poster_url}
                    synopsis={video.synopsis}
                    genre_name={genreMap[video.genre_id]}
                    linkPrefix="/watch"
                  />
                ) : (
                  <a href={`/watch/${video.id}`} className="flex gap-4 items-center bg-card gold-border rounded-sm p-3 hover:bg-surface-hover transition-colors">
                    <img src={getThumbnailUrl(video.thumbnail)} alt={video.title} className="w-16 h-10 object-cover rounded-sm" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm font-semibold text-foreground truncate">{video.title}</h3>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        {genreMap[video.genre_id] || 'Uncategorized'}
                      </p>
                    </div>
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-display text-lg text-muted-foreground">No videos found</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
