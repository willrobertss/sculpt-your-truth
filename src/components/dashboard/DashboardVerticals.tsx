import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Eye, Upload, Image, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoldButton from '@/components/GoldButton';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  myVerticals: any[];
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

const DashboardVerticals = ({ myVerticals, onRefresh }: Props) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [videoUploadTarget, setVideoUploadTarget] = useState<string | null>(null);

  const handleThumbnailUpload = async (verticalId: string, file: File) => {
    setUploading(verticalId);
    try {
      const ext = file.name.split('.').pop();
      const path = `${verticalId}/thumb.${ext}`;
      const { error: uploadError } = await supabase.storage.from('thumbnails').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(path);
      const { error } = await supabase.from('verticals').update({ thumbnail_url: publicUrl }).eq('id', verticalId);
      if (error) throw error;
      toast({ title: 'Thumbnail uploaded!' });
      onRefresh?.();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const handleVideoUpload = async (verticalId: string, file: File) => {
    setUploadingVideo(verticalId);
    try {
      const ext = file.name.split('.').pop();
      const path = `${verticalId}/video.${ext}`;
      const { error: uploadError } = await supabase.storage.from('videos').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(path);
      const { error } = await supabase.from('verticals').update({ video_url: publicUrl }).eq('id', verticalId);
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">My Verticals</h2>
        <GoldButton size="sm" onClick={() => navigate('/submit')}>+ New Vertical</GoldButton>
      </div>
      {myVerticals.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {myVerticals.map((v) => (
            <div key={v.id} className="bg-card gold-border rounded-sm overflow-hidden group hover:ring-1 hover:ring-primary/30 transition-all">
              <div className="relative aspect-[9/16]">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <button
                    onClick={() => { setUploadTarget(v.id); fileInputRef.current?.click(); }}
                    className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors cursor-pointer"
                    disabled={uploading === v.id}
                  >
                    {uploading === v.id ? (
                      <span className="text-xs text-muted-foreground">Uploading...</span>
                    ) : (
                      <>
                        <Image size={24} className="text-muted-foreground" />
                        <span className="font-mono text-[9px] text-muted-foreground">+ Thumbnail</span>
                      </>
                    )}
                  </button>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="font-display text-xs font-semibold text-foreground truncate">{v.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-sm ${statusColor[v.status] || 'bg-muted text-muted-foreground'}`}>
                      {v.status}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                      <Eye size={8} /> {(v.view_count || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Upload overlay actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {v.thumbnail_url && (
                    <button
                      onClick={() => { setUploadTarget(v.id); fileInputRef.current?.click(); }}
                      className="bg-background/80 rounded-sm p-1.5 hover:bg-background transition-colors"
                      title="Replace thumbnail"
                    >
                      <Upload size={12} className="text-foreground" />
                    </button>
                  )}
                  {!v.video_url && (
                    <button
                      onClick={() => setEditingVideo(v.id)}
                      className="bg-background/80 rounded-sm p-1.5 hover:bg-background transition-colors"
                      title="Add video URL"
                    >
                      <Link size={12} className="text-foreground" />
                    </button>
                  )}
                </div>
                {v.video_url && (
                  <div className="absolute top-2 left-2">
                    <span className="font-mono text-[8px] bg-emerald-400/20 text-emerald-400 px-1.5 py-0.5 rounded-sm">
                      Video ✓
                    </span>
                  </div>
                )}
              </div>
              {editingVideo === v.id && (
                <div className="p-2 flex gap-1">
                  <Input
                    placeholder="Video URL..."
                    className="h-7 text-xs bg-surface border-border"
                    value={videoUrls[v.id] || ''}
                    onChange={(e) => setVideoUrls(prev => ({ ...prev, [v.id]: e.target.value }))}
                  />
                  <GoldButton size="sm" className="h-7 text-[10px]" onClick={() => handleSaveVideoUrl(v.id)} disabled={!videoUrls[v.id]}>
                    Save
                  </GoldButton>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card gold-border rounded-sm p-8 text-center">
          <Smartphone size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-body">No verticals yet. Create short-form portrait videos to grow your audience.</p>
          <GoldButton className="mt-4" onClick={() => navigate('/submit')}>Create Vertical</GoldButton>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardVerticals;
