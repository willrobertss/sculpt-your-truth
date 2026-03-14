import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Film, Tv, Upload, Star, Users } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GoldButton from '@/components/GoldButton';
import TestimonialCard from '@/components/TestimonialCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { faqItems } from '@/lib/mock-data';
import { supabase } from '@/integrations/supabase/client';
import { opprimeClient, getThumbnailUrl } from '@/lib/opprime-client';
import heroImage from '@/assets/hero-filmset.jpg';
import logo from '@/assets/logo.png';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

interface OPVideo {
  id: string;
  title: string;
  thumbnail: string | null;
  genre_id: string | null;
  serie_id: string | null;
  approved: boolean;
}

interface OPGenre {
  id: string;
  name: string;
}

interface OPSeries {
  id: string;
  title: string;
}

const Index = () => {
  const [email, setEmail] = useState('');
  const [testimonials, setTestimonials] = useState<Array<{ id: string; name: string; role: string; quote: string; avatar_url: string | null; rating: number }>>([]);
  const [videos, setVideos] = useState<OPVideo[]>([]);
  const [genres, setGenres] = useState<OPGenre[]>([]);
  const [series, setSeries] = useState<OPSeries[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch testimonials from Lovable Cloud + video content from external OPPRIME project
    Promise.all([
      supabase.from('testimonials').select('id, name, role, quote, avatar_url, rating').eq('is_active', true).order('display_order'),
      opprimeClient.from('videos').select('*').eq('approved', true),
      opprimeClient.from('genres').select('*'),
      opprimeClient.from('series').select('*'),
    ]).then(([t, v, g, s]) => {
      if (t.data) setTestimonials(t.data);
      if (v.data) setVideos(v.data as OPVideo[]);
      if (g.data) setGenres(g.data as OPGenre[]);
      if (s.data) setSeries(s.data as OPSeries[]);
    });
  }, []);

  const filteredVideos = useMemo(() => {
    if (!selectedGenre) return videos;
    return videos.filter(v => v.genre_id === selectedGenre);
  }, [videos, selectedGenre]);

  // Group videos: standalone vs series
  const { standaloneVideos, seriesGroups } = useMemo(() => {
    const standalone: OPVideo[] = [];
    const grouped: Record<string, OPVideo[]> = {};

    filteredVideos.forEach(v => {
      if (v.serie_id) {
        if (!grouped[v.serie_id]) grouped[v.serie_id] = [];
        grouped[v.serie_id].push(v);
      } else {
        standalone.push(v);
      }
    });

    return { standaloneVideos: standalone, seriesGroups: grouped };
  }, [filteredVideos]);

  const getSeriesTitle = (id: string) => series.find(s => s.id === id)?.title || 'Series';

  const marqueeText = '★ NEW RELEASES EVERY WEEK ★ INDEPENDENT CINEMA ★ CREATOR-FIRST PLATFORM ★ SHORTS & FEATURES ★ GLOBAL STORYTELLERS ★ ';

  const steps = [
    { icon: Users, label: 'Create Account', desc: 'Sign up free as a creator' },
    { icon: Upload, label: 'Upload', desc: 'Submit your film or short' },
    { icon: Star, label: 'Review', desc: 'Our team curates quality' },
    { icon: Tv, label: 'Go Live', desc: 'Your work streams globally' },
    { icon: Film, label: 'Grow', desc: 'Build your audience & earn' },
  ];

  const valueProps = [
    { title: 'Creator-First', desc: 'Fair revenue share. You own your content. We amplify it.' },
    { title: 'Curated Quality', desc: 'Every title is hand-reviewed by our editorial team.' },
    { title: 'Global Reach', desc: 'Your film, available worldwide from day one.' },
    { title: 'Zero Fees', desc: 'Free to submit. Free to host. We only earn when you do.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden film-grain vignette">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-50" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="flex justify-center mb-2">
              <img src={logo} alt="OPPRIME.tv" className="w-full max-w-lg" />
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-2xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] mb-4 whitespace-nowrap">
              Where Storytellers <span className="text-gold-gradient">Find Their Stage</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="font-body text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-5">
              Stream boundary-pushing features, shorts, and vertical content from the world's most daring independent filmmakers.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface border-border text-foreground placeholder:text-muted-foreground h-12"
              />
              <GoldButton size="md" onClick={() => navigate('/login')} className="h-12 whitespace-nowrap">
                Get Started <ArrowRight size={14} className="ml-2" />
              </GoldButton>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      {testimonials.length > 0 && (
        <section className="py-10 bg-noir-light">
          <div className="container mx-auto px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-5 text-center">What Creators Are Saying</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} name={t.name} role={t.role} quote={t.quote} avatarUrl={t.avatar_url} rating={t.rating} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── GOLD MARQUEE ─── */}
      <div className="bg-primary/10 border-y border-primary/20 py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{marqueeText}{marqueeText}</span>
        </div>
      </div>

      {/* ─── GENRE FILTER BAR ─── */}
      {genres.length > 0 && (
        <div className="container mx-auto px-6 pt-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors ${
                !selectedGenre
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              All
            </button>
            {genres.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`px-4 py-2 rounded-sm font-mono text-xs uppercase tracking-widest transition-colors ${
                  selectedGenre === g.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── VIDEO GRID ─── */}
      <div className="container mx-auto px-6 py-8">
        {/* Series groups */}
        {Object.entries(seriesGroups).map(([serieId, episodes]) => (
          <div key={serieId} className="mb-10">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">
              <span className="text-primary">Series:</span> {getSeriesTitle(serieId)}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {episodes.map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        ))}

        {/* Standalone videos */}
        {standaloneVideos.length > 0 && (
          <div>
            {Object.keys(seriesGroups).length > 0 && (
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4">Standalone Films</h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {standaloneVideos.map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        )}

        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-mono text-sm">No videos found{selectedGenre ? ' for this genre' : ''}.</p>
          </div>
        )}
      </div>

      {/* ─── CREATOR ONBOARDING STEPS ─── */}
      <section className="py-20 bg-noir-light">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-3">For Creators</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              From Upload to <span className="text-gold-gradient">Audience</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full gold-border flex items-center justify-center mb-3 gold-glow">
                  <step.icon size={20} className="text-primary" />
                </div>
                <div className="w-6 h-px bg-primary/30 mb-3 hidden md:block" />
                <h3 className="font-display text-sm font-semibold text-foreground">{step.label}</h3>
                <p className="font-mono text-[9px] text-muted-foreground mt-1 uppercase tracking-wider">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <GoldButton onClick={() => navigate('/submit')}>
              Start Submitting <ArrowRight size={14} className="ml-2" />
            </GoldButton>
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPS ─── */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((prop, i) => (
              <motion.div key={prop.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card gold-border rounded-sm p-6">
                <h3 className="font-display text-lg font-bold text-primary mb-2">{prop.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{prop.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-noir-light">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-3">FAQ</p>
            <h2 className="font-display text-3xl font-bold text-foreground">Questions & Answers</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card gold-border rounded-sm px-5">
                <AccordionTrigger className="font-display text-sm font-semibold text-foreground hover:text-primary">{item.question}</AccordionTrigger>
                <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-24 relative film-grain">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Your Storytelling Deserves a <span className="text-gold-gradient">Stage</span>
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of independent creators streaming their work to a global audience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GoldButton size="lg" onClick={() => navigate('/submit')}>Submit Your Film</GoldButton>
            <GoldButton size="lg" variant="outline" onClick={() => navigate('/browse')}>Browse Library</GoldButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ─── Video Thumbnail Card ─── */
const VideoCard = ({ video }: { video: OPVideo }) => (
  <Link to={`/watch/${video.id}`} className="group block">
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-sm aspect-video gold-border"
    >
      <img
        src={getThumbnailUrl(video.thumbnail)}
        alt={video.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
    <h3 className="font-display text-sm font-semibold text-foreground mt-2 truncate group-hover:text-primary transition-colors">
      {video.title}
    </h3>
  </Link>
);

export default Index;
