import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-noir-light border-t border-border py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <Link to="/" className="font-display text-2xl font-bold tracking-wider">
              <span className="text-foreground">OPPRIME</span>
              <span className="text-primary">.tv</span>
            </Link>
            <p className="text-muted-foreground text-sm mt-4 font-body leading-relaxed">
              The premier destination for independent cinema. Where bold stories find their audience.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-primary mb-4">Explore</h4>
            <div className="flex flex-col gap-2">
              <Link to="/browse" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Films</Link>
              <Link to="/shorts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shorts</Link>
              <Link to="/browse?genre=documentary" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentaries</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-primary mb-4">Creators</h4>
            <div className="flex flex-col gap-2">
              <Link to="/submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Submit Your Film</Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Creator Login</Link>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-primary mb-4">Connect</h4>
            <div className="flex flex-col gap-2">
              {/* HowToSelfTape.com integration point — future API connection */}
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">HowToSelfTape.com</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter / X</a>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            © {new Date().getFullYear()} OPPRIME.tv — All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground font-mono">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground font-mono">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground font-mono">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
