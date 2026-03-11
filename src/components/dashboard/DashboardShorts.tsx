import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tv, Eye, Upload, Image, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoldButton from '@/components/GoldButton';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  myShorts: any[];
  onRefresh?: () => void;
}

const statusColor: Record<string, string> = {
  live: 'bg-emerald-400/20 text-emerald-400',
  pending: 'bg-amber-400/20 text-amber-400',
  in_review: 'bg-blue-400/20 text-blue-400',
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-primary/20 text-primary',
  rejected: 'bg-destructive/20 text-destructive',
};

const DashboardShorts = ({ myShorts, onRefresh }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [videoUploadTarget, setVideoUploadTarget] = useState<string | null>(null);

  const handleThumbnailUpload = async (shortId: string, file: File) => {
    setUploading(shortId);
    try {
      const ext = file.name.split('.').pop();
      const path = `${shortId}/thumb.${ext}`;
      const { error: uploadError } = await supabase.storage.from('thumbnails').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(path);
      const { error } = await supabase.from('shorts').update({ thumbnail_url: publicUrl }).eq('id', shortId);
      if (error) throw error;
      toast({ title: 'Thumbnail uploaded!' });
      onRefresh?.();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const handleVideoUpload = async (shortId: string, file: File) => {
    setUploadingVideo(shortId);
    try {
      const ext = file.name.split('.').pop();
      const path = `${shortId}/video.${ext}`;
      const { error: uploadError } = await supabase.storage.from('videos').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(path);
      const { error } = await supabase.from('shorts').update({ video_url: publicUrl }).eq('id', shortId);
      if (error) throw error;
      toast({ title: 'Video uploaded!' });
      onRefresh?.();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploadingVideo(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadTarget) handleThumbnailUpload(uploadTarget, file);
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && videoUploadTarget) handleVideoUpload(videoUploadTarget, file);
          e.target.value = '';
        }}
      />
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">My Shorts</h2>
        <GoldButton size="sm" onClick={() => navigate('/submit')}>+ New Short</GoldButton>
      </div>
      {myShorts.length > 0 ? (
        <div className="space-y-3">
          {myShorts.map((s) => (
            <div key={s.id} className="bg-card gold-border rounded-sm p-4 hover:bg-surface-hover transition-colors">
              <div className="flex gap-4 items-center">
                {s.thumbnail_url ? (
                  <img src={s.thumbnail_url} alt={s.title} className="w-16 h-20 object-cover rounded-sm" />
                ) : (
                  <button
                    onClick={() => { setUploadTarget(s.id); fileInputRef.current?.click(); }}
                    className="w-16 h-20 bg-muted rounded-sm flex flex-col items-center justify-center gap-1 hover:bg-muted/80 transition-colors cursor-pointer"
                    disabled={uploading === s.id}
                  >
                    {uploading === s.id ? (
                      <span className="text-[9px] text-muted-foreground">...</span>
                    ) : (
                      <>
                        <Image size={16} className="text-muted-foreground" />
                        <span className="font-mono text-[8px] text-muted-foreground">+ Thumb</span>
                      </>
                    )}
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm font-semibold text-foreground truncate">{s.title}</h3>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                    {s.duration_seconds ? `${s.duration_seconds}s` : ''} {(s.genre || []).length > 0 ? `· ${(s.genre || []).join(' · ')}` : ''}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-sm ${statusColor[s.status] || 'bg-muted text-muted-foreground'}`}>
                      {s.status}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Eye size={10} /> {(s.view_count || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {s.thumbnail_url && (
                  <button
                    onClick={() => { setUploadTarget(s.id); fileInputRef.current?.click(); }}
                    className="font-mono text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <Upload size={10} /> Replace Thumbnail
                  </button>
                )}
                {!s.video_url ? (
                  <button
                    onClick={() => { setVideoUploadTarget(s.id); videoInputRef.current?.click(); }}
                    className="font-mono text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    disabled={uploadingVideo === s.id}
                  >
                    {uploadingVideo === s.id ? (
                      <span className="flex items-center gap-1"><Upload size={10} className="animate-pulse" /> Uploading...</span>
                    ) : (
                      <><Upload size={10} /> Upload Video</>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                      <Link size={10} /> Video ✓
                    </span>
                    <button
                      onClick={() => { setVideoUploadTarget(s.id); videoInputRef.current?.click(); }}
                      className="font-mono text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                      disabled={uploadingVideo === s.id}
                    >
                      {uploadingVideo === s.id ? 'Uploading...' : 'Replace'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card gold-border rounded-sm p-8 text-center">
          <Tv size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-body">No shorts yet. Upload a vertical short film.</p>
          <GoldButton className="mt-4" onClick={() => navigate('/submit')}>Upload Short</GoldButton>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardShorts;
