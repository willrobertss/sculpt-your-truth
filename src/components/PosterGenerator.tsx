import { useState } from 'react';
import { Wand2, Loader2, Check, Download, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PosterGeneratorProps {
  videoId: string;
  videoTitle: string;
  synopsis?: string | null;
  currentThumbnail?: string | null;
  onGenerated: (posterUrl: string) => void;
  table?: 'videos' | 'films' | 'shorts' | 'verticals';
}

const PosterGenerator = ({ videoId, videoTitle, synopsis, currentThumbnail, onGenerated, table = 'videos' }: PosterGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-poster', {
        body: {
          videoId,
          title: videoTitle,
          synopsis: synopsis || '',
          thumbnailUrl: currentThumbnail || '',
          table,
          aspectRatio,
        },
      });

      if (error) throw error;
      if (data?.posterUrl) {
        setPreview(data.posterUrl);
        toast.success('Poster generated!');
      } else {
        throw new Error(data?.error || 'Failed to generate poster');
      }
    } catch (e: any) {
      console.error('Poster generation error:', e);
      toast.error(e.message || 'Failed to generate poster');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!preview) return;
    try {
      const response = await fetch(preview);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoTitle.replace(/\s+/g, '_')}_poster.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download poster');
    }
  };

  const handleUseAsPoster = () => {
    if (!preview) return;
    onGenerated(preview);
    toast.success('Poster set as film thumbnail!');
  };

  return (
    <div className="space-y-3">
      {/* Aspect Ratio Selector */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Poster Orientation</p>
        <RadioGroup
          value={aspectRatio}
          onValueChange={(v) => setAspectRatio(v as '16:9' | '9:16')}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="9:16" id="portrait" />
            <Label htmlFor="portrait" className="font-mono text-xs cursor-pointer">Portrait (9:16)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="16:9" id="landscape" />
            <Label htmlFor="landscape" className="font-mono text-xs cursor-pointer">Landscape (16:9)</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          variant="outline"
          className="font-mono text-xs uppercase tracking-widest"
        >
          {generating ? (
            <><Loader2 size={14} className="animate-spin mr-2" /> Generating...</>
          ) : preview ? (
            <><Check size={14} className="mr-2 text-emerald-400" /> Regenerate Poster</>
          ) : (
            <><Wand2 size={14} className="mr-2" /> AI Generate Poster</>
          )}
        </Button>
      </div>

      {/* Preview + Action Buttons */}
      {preview && (
        <div className="space-y-3">
          <div className={`rounded-sm overflow-hidden border border-primary/30 ${aspectRatio === '9:16' ? 'w-24 h-[170px]' : 'w-48 h-28'}`}>
            <img src={preview} alt="Generated poster" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="font-mono text-[10px] uppercase tracking-widest"
            >
              <Download size={12} className="mr-1" /> Download
            </Button>
            <Button
              type="button"
              onClick={handleUseAsPoster}
              size="sm"
              className="font-mono text-[10px] uppercase tracking-widest"
            >
              <ImageIcon size={12} className="mr-1" /> Use as Film Poster
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterGenerator;
