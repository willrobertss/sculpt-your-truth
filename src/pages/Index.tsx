import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Film, Tv, Upload, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FilmCard from '@/components/FilmCard';
import ShortCard from '@/components/ShortCard';
import CreatorCard from '@/components/CreatorCard';
import ContentRow from '@/components/ContentRow';
import GoldButton from '@/components/GoldButton';
import TestimonialCard from '@/components/TestimonialCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { faqItems } from '@/lib/mock-data';
import { supabase } from '@/integrations/supabase/client';
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

const Index = () => {
  const [email, setEmail] = useState('');
  const [testimonials, setTestimonials] = useState<Array<{ id: string; name: string; role: string; quote: string; avatar_url: string | null; rating: number }>>([]);
  const [films, setFilms] = useState<any[]>([]);
  const [shorts, setShorts] = useState<any[]>([]);
  const [verticals, setVerticals] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all data in parallel
    Promise.all([
      supabase.from('testimonials').select('id, name, role, quote, avatar_url, rating').eq('is_active', true).order('display_order'),
      supabase.from('films').select('id, title, tagline, genre, duration_minutes, release_year, poster_url, featured, view_count').eq('status', 'live').order('created_at', { ascending: false }).limit(12),
      supabase.from('shorts').select('id, title, description, thumbnail_url, duration_seconds, genre, view_count').eq('status', 'live').order('created_at', { ascending: false }).limit(8),
      supabase.from('profiles').select('id, display_name, slug, avatar_url, bio, genre_focus, user_id').limit(8),
      supabase.from('verticals').select('id, title, description, thumbnail_url, duration_seconds, genre, view_count').eq('status', 'live').order('created_at', { ascending: false }).limit(8),
    ]).then(([t, f, s, c, v]) => {
      if (t.data) setTestimonials(t.data);
      if (f.data) setFilms(f.data);
      if (s.data) setShorts(s.data);
      if (c.data) setCreators(c.data.map(p => ({ ...p, film_count: 0 })));
      if (v.data) setVerticals(v.data);
    });
  }, []);

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

  const dramaFilms = films.filter(f => (f.genre || []).includes('Drama'));
  const docFilms = films.filter(f => (f.genre || []).includes('Documentary'));

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

      {/* ─── CONTENT ROWS ─── */}
      <div className="py-8">
        {films.length > 0 && (
          <ContentRow title="New Releases" viewAllLink="/browse">
            {films.slice(0, 8).map((film) => (
              <FilmCard key={film.id} id={film.id} title={film.title} genre={film.genre || []} poster_url={film.poster_url || ''} release_year={film.release_year} duration_minutes={film.duration_minutes} />
            ))}
          </ContentRow>
        )}

        {shorts.length > 0 && (
          <ContentRow title="Short Films" viewAllLink="/shorts">
            {shorts.map((short) => (
              <ShortCard key={short.id} {...short} />
            ))}
          </ContentRow>
        )}

        {verticals.length > 0 && (
          <ContentRow title="Verticals" viewAllLink="/verticals">
            {verticals.map((v) => (
              <ShortCard key={v.id} id={v.id} title={v.title} thumbnail_url={v.thumbnail_url || ''} duration_seconds={v.duration_seconds} view_count={v.view_count} />
            ))}
          </ContentRow>
        )}

        {dramaFilms.length > 0 && (
          <ContentRow title="Featured Dramas" viewAllLink="/browse?genre=drama">
            {dramaFilms.map((film) => (
              <FilmCard key={film.id} id={film.id} title={film.title} genre={film.genre || []} poster_url={film.poster_url || ''} release_year={film.release_year} duration_minutes={film.duration_minutes} />
            ))}
          </ContentRow>
        )}

        {docFilms.length > 0 && (
          <ContentRow title="Documentaries" viewAllLink="/browse?genre=documentary">
            {docFilms.map((film) => (
              <FilmCard key={film.id} id={film.id} title={film.title} genre={film.genre || []} poster_url={film.poster_url || ''} release_year={film.release_year} duration_minutes={film.duration_minutes} />
            ))}
          </ContentRow>
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

      {/* ─── CREATOR SPOTLIGHT ─── */}
      {creators.length > 0 && (
        <ContentRow title="Creator Spotlight">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} {...creator} />
          ))}
        </ContentRow>
      )}

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

export default Index;
