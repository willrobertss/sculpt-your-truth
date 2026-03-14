import { useState, useRef, useEffect } from 'react';
import { Pencil, Upload, Loader2, X, Image, Film } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PosterGenerator from '@/components/PosterGenerator';

type ContentType = 'films' | 'shorts' | 'verticals';

interface ContentEditDialogProps {
  open: boolean;
  onClose: () => void;
  item: any;
  contentType: ContentType;
  userId: string;
  onSaved: () => void;
}

const GENRE_OPTIONS = [
  'Drama', 'Comedy', 'Horror', 'Thriller', 'Sci-Fi', 'Documentary',
  'Action', 'Romance', 'Animation', 'Fantasy', 'Mystery', 'Experimental',
];

const ContentEditDialog = ({ open, onClose, item, contentType, userId, onSaved }: ContentEditDialogProps) => {
  const { toast } = useToast();
  const posterRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState<string[]>([]);
  const [duration, setDuration] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [posterPreview, setPosterPreview] = useState('');
  const [videoStatus, setVideoStatus] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setDescription(contentType === 'films' ? (item.synopsis || '') : (item.description || ''));
      setGenre(item.genre || []);
      setDuration(contentType === 'films' ? (item.duration_minutes?.toString() || '') : (item.duration_seconds?.toString() || ''));
      setReleaseYear(item.release_year?.toString() || '');
      setPosterPreview(contentType === 'films' ? (item.poster_url || '') : (item.thumbnail_url || ''));
      setVideoStatus(item.video_url ? 'uploaded' : '');
    }
  }, [item, contentType]);

  const handlePosterUpload = async (file: File) => {
    setUploadingPoster(true);
    try {
      const ext = file.name.split('.').pop();
      const bucket = contentType === 'films' ? 'posters' : 'thumbnails';
      const path = `${userId}/${item.id}/image.${ext}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      const urlCol = contentType === 'films' ? 'poster_url' : 'thumbnail_url';
      const { error } = await supabase.from(contentType).update({ [urlCol]: publicUrl }).eq('id', item.id);
      if (error) throw error;
      setPosterPreview(publicUrl + '?t=' + Date.now());
      toast({ title: 'Image uploaded!' });
      onSaved();
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum video size is 500MB', variant: 'destructive' });
      return;
    }
    setUploadingVideo(true);
    setVideoStatus('uploading');
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/${item.id}/video.${ext}`;
      const { error: uploadError } = await supabase.storage.from('videos').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(path);
      const { error } = await supabase.from(contentType).update({ video_url: publicUrl }).eq('id', item.id);
      if (error) throw error;
      setVideoStatus('uploaded');
      toast({ title: 'Video uploaded!' });
      onSaved();
    } catch (e: any) {
      setVideoStatus(item.video_url ? 'uploaded' : '');
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: any = { title, genre };
      if (contentType === 'films') {
        updateData.synopsis = description;
        if (duration) updateData.duration_minutes = parseInt(duration);
        if (releaseYear) updateData.release_year = parseInt(releaseYear);
      } else {
        updateData.description = description;
        if (duration) updateData.duration_seconds = parseInt(duration);
      }
      const { error } = await supabase.from(contentType).update(updateData).eq('id', item.id);
      if (error) throw error;
      toast({ title: 'Saved!' });
      onSaved();
      onClose();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleGenre = (g: string) => {
    setGenre(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">Edit {contentType === 'films' ? 'Film' : contentType === 'shorts' ? 'Short' : 'Vertical'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Poster/Thumbnail upload */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
              {contentType === 'films' ? 'Poster' : 'Thumbnail'}
            </label>
            <div className="flex gap-4 items-start">
              <div
                onClick={() => posterRef.current?.click()}
                className="w-24 h-32 rounded-sm overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all relative group"
              >
                {posterPreview ? (
                  <img src={posterPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Image size={24} className="text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingPoster ? <Loader2 size={16} className="animate-spin text-primary" /> : <Upload size={16} className="text-primary" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Click to upload an image.<br />JPG or PNG recommended.</p>
              <input ref={posterRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handlePosterUpload(f); e.target.value = ''; }} />
            </div>
          </div>

          {/* Video upload */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Video File</label>
            <div
              onClick={() => !uploadingVideo && videoRef.current?.click()}
              className={`border border-dashed rounded-sm p-4 text-center cursor-pointer transition-colors ${
                videoStatus === 'uploaded' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border hover:border-primary/50'
              }`}
            >
              {uploadingVideo ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="font-mono text-xs text-muted-foreground">Uploading video...</span>
                </div>
              ) : videoStatus === 'uploaded' ? (
                <div className="flex items-center justify-center gap-2">
                  <Film size={16} className="text-emerald-400" />
                  <span className="font-mono text-xs text-emerald-400">Video uploaded ✓</span>
                  <span className="font-mono text-[10px] text-muted-foreground ml-2">Click to replace</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload size={20} className="text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">Click to upload video</span>
                  <span className="font-mono text-[9px] text-muted-foreground">MP4, MOV, WebM · Max 500MB</span>
                </div>
              )}
            </div>
            <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); e.target.value = ''; }} />
          </div>

          {/* Title */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
              {contentType === 'films' ? 'Synopsis' : 'Description'}
            </label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>

          {/* Duration */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                {contentType === 'films' ? 'Duration (min)' : 'Duration (sec)'}
              </label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
            {contentType === 'films' && (
              <div className="flex-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">Release Year</label>
                <Input type="number" value={releaseYear} onChange={e => setReleaseYear(e.target.value)} />
              </div>
            )}
          </div>

          {/* Genre */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Genre</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm border transition-colors ${
                    genre.includes(g)
                      ? 'bg-primary/20 text-primary border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground'
                  }`}
                >
                  {g}
                  {genre.includes(g) && <X size={8} className="inline ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* AI Poster Generator */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">AI Poster</label>
            <PosterGenerator
              videoId={item.id}
              videoTitle={title}
              synopsis={description}
              currentThumbnail={posterPreview}
              onGenerated={() => onSaved()}
              table={contentType}
            />
          </div>

          <Button onClick={handleSave} disabled={saving || !title} className="w-full">
            {saving ? <><Loader2 size={14} className="animate-spin mr-2" /> Saving...</> : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentEditDialog;
