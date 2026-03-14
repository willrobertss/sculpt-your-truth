import { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Trash2, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ShareDialog from '@/components/ShareDialog';

interface SocialSpotlightProps {
  videoId: string;
  userId: string | null;
  liked: boolean;
  likeCount: number;
  comments: any[];
  shareUrl: string;
  onLikeToggle: () => void;
  onCommentAdd: (comment: any) => void;
  onCommentDelete: (commentId: string) => void;
}

const SocialSpotlight = ({
  videoId,
  userId,
  liked,
  likeCount,
  comments,
  shareUrl,
  onLikeToggle,
  onCommentAdd,
  onCommentDelete,
}: SocialSpotlightProps) => {
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const handleLike = () => {
    if (!userId) {
      toast.error('Sign in to like videos');
      return;
    }
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 600);
    onLikeToggle();
  };

  const handleComment = async () => {
    if (!userId) {
      toast.error('Sign in to comment');
      return;
    }
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    const { data, error } = await supabase
      .from('video_comments')
      .insert({
        video_id: videoId,
        user_id: userId,
        content: newComment.trim(),
      })
      .select()
      .single();
    setSubmittingComment(false);
    if (error) {
      toast.error('Failed to post comment');
      return;
    }
    onCommentAdd(data);
    setNewComment('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  const avatarColors = [
    'from-pink-500 to-rose-400',
    'from-violet-500 to-purple-400',
    'from-orange-500 to-amber-400',
    'from-emerald-500 to-teal-400',
    'from-cyan-500 to-blue-400',
  ];

  const getAvatarColor = (id: string) => {
    const idx = id.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
  };

  return (
    <div className="lg:w-1/4 lg:min-w-[280px] flex flex-col rounded-lg overflow-hidden bg-card/80 backdrop-blur-sm border border-border/50">
      {/* Gradient Spotlight Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-xs uppercase tracking-[0.2em] font-mono">
            Spotlight
          </span>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 group"
          >
            <div className={`transition-transform duration-300 ${heartAnimating ? 'scale-150' : 'scale-100'}`}>
              <Heart
                size={22}
                className={`transition-colors ${liked ? 'text-white fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'text-white/70 group-hover:text-white'}`}
                fill={liked ? 'currentColor' : 'none'}
              />
            </div>
            <span className="text-white font-bold text-sm">{likeCount}</span>
          </button>

          <div className="flex items-center gap-2 text-white/80">
            <MessageCircle size={18} />
            <span className="text-sm font-medium">{comments.length}</span>
          </div>

          <button
            onClick={handleShare}
            className="text-white/80 hover:text-white transition-colors hover:scale-110 active:scale-95 duration-200"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Share / Recommend Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-b border-border/30 p-4">
        <p className="text-foreground font-display text-sm font-semibold mb-1">
          🎬 Enjoying this?
        </p>
        <p className="text-muted-foreground text-xs mb-3">
          Let your friends know about this film!
        </p>
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-purple-500/20"
        >
          <ExternalLink size={14} />
          Share This Film
        </button>
      </div>

      {/* Comments Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-4 pt-3 pb-2">
          Comments
        </p>

        <ScrollArea className="flex-1 max-h-[400px] lg:max-h-[50vh]">
          <div className="px-4 space-y-2.5 pb-3">
            {comments.length === 0 && (
              <div className="text-center py-6">
                <MessageCircle size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-muted-foreground text-xs font-mono">
                  No comments yet. Be the first!
                </p>
              </div>
            )}
            {comments.map((c) => (
              <div
                key={c.id}
                className="group bg-white/[0.03] hover:bg-white/[0.06] rounded-lg p-3 border-l-2 border-transparent hover:border-purple-500/50 transition-all duration-200"
              >
                <div className="flex items-start gap-2.5">
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(c.user_id)} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-[10px] font-bold">
                      {getInitials(c.user_id)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm leading-relaxed break-words">
                      {c.content}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
                      {new Date(c.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {c.user_id === userId && (
                    <button
                      onClick={() => onCommentDelete(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0 mt-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Styled Comment Input */}
        <div className="p-3 border-t border-border/50">
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative group">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={userId ? 'Add a comment...' : 'Sign in to comment'}
                disabled={!userId || submittingComment}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                className="text-sm rounded-full bg-white/[0.04] border-border/40 focus:border-purple-500/50 focus:ring-purple-500/20 pr-10"
              />
            </div>
            <Button
              onClick={handleComment}
              disabled={!userId || !newComment.trim() || submittingComment}
              size="icon"
              className="rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 hover:opacity-90 text-white border-0 h-9 w-9 shrink-0"
            >
              <Send size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSpotlight;
