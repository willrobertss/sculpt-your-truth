import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { opprimeClient, getVideoUrl, getThumbnailUrl } from '@/lib/opprime-client';

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
          // Build video URL from the 'url' column if it exists, otherwise try other fields
          const urlPath = (data as any).url || null;
          setVideoUrl(getVideoUrl(urlPath));

          // If part of a series, fetch other episodes
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 font-mono text-xs uppercase tracking-widest">
          <ArrowLeft size={14} /> Back to Library
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Player */}
          <div className="flex-1">
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
          </div>

          {/* Series sidebar */}
          {seriesEpisodes.length > 0 && (
            <div className="lg:w-80 shrink-0">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">More from this Series</h3>
              <div className="space-y-3">
                {seriesEpisodes.map((ep) => (
                  <Link
                    key={ep.id}
                    to={`/watch/${ep.id}`}
                    className="flex gap-3 p-2 rounded-sm hover:bg-card transition-colors group"
                  >
                    <img
                      src={getThumbnailUrl(ep.thumbnail)}
                      alt={ep.title}
                      className="w-28 h-16 object-cover rounded-sm shrink-0"
                      loading="lazy"
                    />
                    <p className="font-display text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {ep.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Watch;
