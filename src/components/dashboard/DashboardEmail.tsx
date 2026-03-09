import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Share2, Users, Link2, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Props {
  myFilms: any[];
  myShorts: any[];
  profile: any;
  user: any;
}

const DashboardEmail = ({ myFilms, myShorts, profile, user }: Props) => {
  const [activeEmailTab, setActiveEmailTab] = useState<'share' | 'newsletter' | 'collab'>('share');
  const [selectedContent, setSelectedContent] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const siteUrl = window.location.origin;
  const allContent = [
    ...myFilms.filter(f => f.status === 'live').map(f => ({ ...f, type: 'film' as const })),
    ...myShorts.filter(s => s.status === 'live').map(s => ({ ...s, type: 'short' as const })),
  ];
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'A creator';

  const getContentUrl = (item: any) => {
    if (item.type === 'film') return `${siteUrl}/film/${item.slug || item.id}`;
    return `${siteUrl}/shorts`;
  };

  const copyLink = (item: any) => {
    navigator.clipboard.writeText(getContentUrl(item));
    setCopiedId(item.id);
    toast({ title: 'Link copied!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openShareEmail = () => {
    const content = allContent.find(c => c.id === selectedContent);
    if (!content) {
      toast({ title: 'Select content to share', variant: 'destructive' });
      return;
    }
    const url = getContentUrl(content);
    const subject = encodeURIComponent(`Check out "${content.title}" on OPPRIME.tv`);
    const body = encodeURIComponent(
      `${customMessage ? customMessage + '\n\n' : ''}${displayName} shared "${content.title}" with you on OPPRIME.tv:\n\n${url}\n\nWatch now on OPPRIME.tv`
    );
    const mailto = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    window.open(mailto, '_blank');
  };

  const openNewsletterEmail = () => {
    const liveContent = allContent.slice(0, 5);
    const contentList = liveContent.map(c => `• ${c.title} — ${getContentUrl(c)}`).join('\n');
    const subject = encodeURIComponent(`Updates from ${displayName} on OPPRIME.tv`);
    const body = encodeURIComponent(
      `${customMessage ? customMessage + '\n\n' : ''}Here's what's new from ${displayName}:\n\n${contentList}\n\nWatch all content: ${siteUrl}/creators/${profile?.slug || ''}\n\n— ${displayName}`
    );
    const mailto = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    window.open(mailto, '_blank');
  };

  const openCollabEmail = () => {
    const subject = encodeURIComponent(`Collaboration invite from ${displayName} — OPPRIME.tv`);
    const body = encodeURIComponent(
      `Hi,\n\n${customMessage || `I'd love to collaborate with you on a project.`}\n\nCheck out my work on OPPRIME.tv: ${siteUrl}/creators/${profile?.slug || ''}\n\nLet me know if you're interested!\n\n— ${displayName}`
    );
    const mailto = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    window.open(mailto, '_blank');
  };

  const emailTabs = [
    { id: 'share' as const, label: 'Share Film', icon: Share2 },
    { id: 'newsletter' as const, label: 'Newsletter', icon: Mail },
    { id: 'collab' as const, label: 'Collaborate', icon: Users },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Share & Invite</h2>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        {emailTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveEmailTab(tab.id); setCustomMessage(''); setRecipientEmail(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-[10px] uppercase tracking-widest transition-colors ${
              activeEmailTab === tab.id ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-card text-muted-foreground border border-border hover:text-foreground'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Share Links */}
      {allContent.length > 0 && (
        <div className="mb-6">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Quick Copy Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allContent.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-card gold-border rounded-sm p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs font-semibold text-foreground truncate">{item.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{getContentUrl(item)}</p>
                </div>
                <button onClick={() => copyLink(item)} className="text-muted-foreground hover:text-primary transition-colors">
                  {copiedId === item.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Compose */}
      <div className="bg-card gold-border rounded-sm p-6 max-w-lg">
        {activeEmailTab === 'share' && (
          <>
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Share2 size={18} className="text-primary" /> Share a Film or Short
            </h3>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Select Content</label>
                <select
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  className="w-full bg-background border border-border rounded-sm p-2.5 text-foreground text-sm"
                >
                  <option value="">Choose a film or short...</option>
                  {allContent.map((item) => (
                    <option key={item.id} value={item.id}>{item.title} ({item.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Recipient Email</label>
                <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="friend@example.com" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Personal Message (optional)</label>
                <Textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Hey, check out my latest film!" rows={3} />
              </div>
              <Button onClick={openShareEmail} className="w-full bg-primary text-primary-foreground hover:bg-gold-light font-mono uppercase tracking-widest text-xs">
                <Mail size={14} className="mr-2" /> Open in Email
              </Button>
            </div>
          </>
        )}

        {activeEmailTab === 'newsletter' && (
          <>
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail size={18} className="text-primary" /> Send Update Newsletter
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Share your latest content with followers. This will open your email client with all your live content listed.
            </p>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Recipient(s)</label>
                <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="supporter@example.com" />
                <p className="font-mono text-[10px] text-muted-foreground mt-1">Tip: add multiple recipients in your email client after opening</p>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Personal Note (optional)</label>
                <Textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Exciting updates coming your way..." rows={3} />
              </div>
              <Button onClick={openNewsletterEmail} className="w-full bg-primary text-primary-foreground hover:bg-gold-light font-mono uppercase tracking-widest text-xs">
                <Mail size={14} className="mr-2" /> Open Newsletter in Email
              </Button>
            </div>
          </>
        )}

        {activeEmailTab === 'collab' && (
          <>
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" /> Collaboration Invite
            </h3>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Reach out to fellow creators for collaborations. Your profile link is included automatically.
            </p>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Creator's Email</label>
                <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="creator@example.com" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Your Message</label>
                <Textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="I'd love to collaborate on a short film project..." rows={4} />
              </div>
              <Button onClick={openCollabEmail} className="w-full bg-primary text-primary-foreground hover:bg-gold-light font-mono uppercase tracking-widest text-xs">
                <Mail size={14} className="mr-2" /> Open Invite in Email
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardEmail;
