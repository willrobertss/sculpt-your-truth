import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AdminDialog from './AdminDialog';
import StatusBadge from './StatusBadge';

interface Video {
  id: string;
  title: string;
  synopsis: string | null;
  thumbnail: string | null;
  approved: boolean;
  thumb_approved: boolean;
  reviewed: boolean;
  director?: string;
}

interface VideoApprovalDialogProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: () => void;
}

const STORAGE_BASE = import.meta.env.VITE_FILE_STORAGE_PATH || '';

const VideoApprovalDialog = ({ video, open, onOpenChange, onAction }: VideoApprovalDialogProps) => {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectThumbOpen, setRejectThumbOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!video) return null;

  const thumbSrc = video.thumbnail
    ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${STORAGE_BASE}${video.thumbnail}`)
    : null;

  const handleApprove = async (approveThumb: boolean) => {
    setLoading(true);
    const update: any = { approved: true, reviewed: true };
    if (approveThumb) update.thumb_approved = true;
    const { error } = await supabase.from('videos').update(update).eq('id', video.id);
    setLoading(false);
    if (error) { toast.error('Failed to approve'); return; }
    toast.success('Video approved');
    onAction();
    onOpenChange(false);
  };

  const handleRejectFilm = async () => {
    if (!reason.trim()) { toast.error('Reason is required'); return; }
    setLoading(true);
    const { error } = await supabase.from('videos').update({ reviewed: true, approved: false }).eq('id', video.id);
    setLoading(false);
    if (error) { toast.error('Failed to reject'); return; }
    toast.success('Video rejected');
    setRejectOpen(false);
    onAction();
    onOpenChange(false);
  };

  const handleRejectThumb = async () => {
    if (!reason.trim()) { toast.error('Reason is required'); return; }
    setLoading(true);
    const { error } = await supabase.from('videos').update({ thumb_approved: false, reviewed: true }).eq('id', video.id);
    setLoading(false);
    if (error) { toast.error('Failed to reject thumbnail'); return; }
    toast.success('Thumbnail rejected');
    setRejectThumbOpen(false);
    onAction();
    onOpenChange(false);
  };

  const handleApproveThumb = async () => {
    setLoading(true);
    const { error } = await supabase.from('videos').update({ thumb_approved: true }).eq('id', video.id);
    setLoading(false);
    if (error) { toast.error('Failed'); return; }
    toast.success('Thumbnail approved');
    onAction();
  };

  return (
    <>
      <AdminDialog open={open} onOpenChange={onOpenChange} title="Video Review" className="max-w-3xl">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: thumbnail */}
          <div className="relative w-full md:w-[220px] flex-shrink-0">
            {thumbSrc ? (
              <div className="relative group">
                <img src={thumbSrc} alt={video.title} className="h-[290px] w-full object-cover rounded-[24px]" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px] flex items-center justify-center gap-3">
                  <button
                    onClick={() => setRejectThumbOpen(true)}
                    className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                  >
                    <X size={18} />
                  </button>
                  {!video.thumb_approved && (
                    <button
                      onClick={handleApproveThumb}
                      className="p-2 bg-green-600 rounded-full text-white hover:bg-green-700"
                    >
                      <Check size={18} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-[290px] bg-gray-100 rounded-[24px] flex items-center justify-center text-gray-400 text-sm">No thumbnail</div>
            )}
          </div>

          {/* Right: details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <StatusBadge approved={video.approved} label={video.approved ? 'Film Approved' : 'Film Reproved'} />
              <StatusBadge approved={video.thumb_approved} label={video.thumb_approved ? 'Thumb OK' : 'Thumb Reproved'} />
            </div>
            <h3 className="font-heading text-2xl uppercase tracking-wide text-black">{video.title}</h3>
            {video.director && <p className="font-heading text-sm text-gray-600 uppercase">{video.director}</p>}
            <p className="font-sans text-sm text-gray-600 line-clamp-7">{video.synopsis || 'No synopsis provided.'}</p>
          </div>
        </div>

        {/* Bottom action buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
          {!video.approved && !video.thumb_approved && !video.reviewed && (
            <Button
              onClick={() => handleApprove(true)}
              disabled={loading}
              className="bg-[hsl(356,80%,42%)] hover:bg-[hsl(356,80%,35%)] text-white font-heading uppercase tracking-wider rounded-full px-6"
            >
              Approve Film and Thumbnail
            </Button>
          )}
          {!video.approved && (
            <>
              <Button
                onClick={() => handleApprove(false)}
                disabled={loading}
                className="bg-[hsl(356,80%,42%)] hover:bg-[hsl(356,80%,35%)] text-white font-heading uppercase tracking-wider rounded-full px-6"
              >
                Approve Film
              </Button>
              <Button
                onClick={() => { setReason(''); setRejectOpen(true); }}
                disabled={loading}
                variant="outline"
                className="border-black text-black font-heading uppercase tracking-wider rounded-full px-6 hover:bg-gray-100"
              >
                Reject Film
              </Button>
            </>
          )}
        </div>
      </AdminDialog>

      {/* Reject Film dialog */}
      <AdminDialog open={rejectOpen} onOpenChange={setRejectOpen} title="Reject Film" description="Please provide a reason for rejection.">
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection..."
          className="bg-white border-gray-300 text-black font-sans min-h-[100px]"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setRejectOpen(false)} className="font-heading uppercase tracking-wider">Cancel</Button>
          <Button onClick={handleRejectFilm} disabled={loading} className="bg-[hsl(356,80%,42%)] text-white font-heading uppercase tracking-wider">Confirm Rejection</Button>
        </div>
      </AdminDialog>

      {/* Reject Thumbnail dialog */}
      <AdminDialog open={rejectThumbOpen} onOpenChange={setRejectThumbOpen} title="Reject Thumbnail" description="Please provide a reason.">
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason..."
          className="bg-white border-gray-300 text-black font-sans min-h-[100px]"
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setRejectThumbOpen(false)} className="font-heading uppercase tracking-wider">Cancel</Button>
          <Button onClick={handleRejectThumb} disabled={loading} className="bg-[hsl(356,80%,42%)] text-white font-heading uppercase tracking-wider">Confirm</Button>
        </div>
      </AdminDialog>
    </>
  );
};

export default VideoApprovalDialog;
