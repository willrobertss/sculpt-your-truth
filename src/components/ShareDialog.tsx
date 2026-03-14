import { useState } from 'react';
import { Copy, Mail, MessageSquare, Share2, X as XIcon, Check, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  videoTitle: string;
}

const MESSAGE_TEMPLATES = [
  'You NEED to watch this 🎬🔥',
  'This just blew my mind, check it out!',
  'Found your next favorite film 🍿',
  'Okay this is actually incredible...',
];

const ShareDialog = ({ open, onOpenChange, shareUrl, videoTitle }: ShareDialogProps) => {
  const [message, setMessage] = useState(MESSAGE_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);

  const fullText = `${message}\n\n${videoTitle}\n${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: videoTitle, text: message, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSMS = () => {
    window.open(`sms:?body=${encodeURIComponent(fullText)}`, '_self');
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(`Check out: ${videoTitle}`)}&body=${encodeURIComponent(fullText)}`, '_self');
  };

  const channels = [
    { label: 'Copy Link', icon: copied ? Check : Copy, action: handleCopy, color: 'from-emerald-500 to-teal-500' },
    { label: 'WhatsApp', icon: MessageSquare, action: handleWhatsApp, color: 'from-green-500 to-green-600' },
    { label: 'X / Twitter', icon: XIcon, action: handleTwitter, color: 'from-zinc-600 to-zinc-800' },
    { label: 'Facebook', icon: Share2, action: handleFacebook, color: 'from-blue-600 to-blue-700' },
    { label: 'Text / SMS', icon: Smartphone, action: handleSMS, color: 'from-violet-500 to-purple-600' },
    { label: 'Email', icon: Mail, action: handleEmail, color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/50 bg-card">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 p-5 pb-4">
          <DialogHeader>
            <DialogTitle className="text-white font-display text-lg">
              Share "{videoTitle}"
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-xs mt-1 font-mono uppercase tracking-wider">
            Add a message & pick a channel
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick templates */}
          <div className="flex flex-wrap gap-2">
            {MESSAGE_TEMPLATES.map((tpl) => (
              <button
                key={tpl}
                onClick={() => setMessage(tpl)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  message === tpl
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white border-transparent shadow-md shadow-purple-500/20'
                    : 'border-border/60 text-muted-foreground hover:border-purple-500/50 hover:text-foreground'
                }`}
              >
                {tpl}
              </button>
            ))}
          </div>

          {/* Editable message */}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a fun message..."
            className="min-h-[80px] resize-none bg-white/[0.04] border-border/40 focus:border-purple-500/50 focus:ring-purple-500/20 text-sm"
          />

          {/* Share channels grid */}
          <div className="grid grid-cols-3 gap-2">
            {channels.map((ch) => (
              <button
                key={ch.label}
                onClick={ch.action}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-white/[0.06] transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ch.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <ch.icon size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                  {ch.label}
                </span>
              </button>
            ))}
          </div>

          {/* Native share (mobile) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-purple-500/20"
            >
              <Share2 size={14} />
              More sharing options
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
