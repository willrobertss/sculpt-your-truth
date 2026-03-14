import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';


const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Browse', href: '/browse' },
    { label: 'Shorts', href: '/shorts' },
    { label: 'Verticals', href: '/verticals' },
    { label: 'Submit', href: '/submit' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="font-display text-lg font-bold text-foreground">OPPRIME<span className="text-primary">.TV</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="font-mono text-sm uppercase tracking-widest text-primary/70 hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button
              variant="outline"
              size="sm"
              className="gold-border text-primary hover:bg-primary hover:text-primary-foreground font-mono uppercase tracking-widest text-xs"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-gold-light font-mono uppercase tracking-widest text-xs"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-gold-light font-mono uppercase tracking-widest text-xs w-fit"
                onClick={() => { navigate(user ? '/dashboard' : '/login'); setMobileOpen(false); }}
              >
                {user ? 'Dashboard' : 'Sign In'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
