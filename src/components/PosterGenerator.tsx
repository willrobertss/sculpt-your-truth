import { useState } from 'react';
import { Wand2, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        },
      });

      if (error) throw error;
      if (data?.posterUrl) {
        setPreview(data.posterUrl);
        onGenerated(data.posterUrl);
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

  return (
    <div className="space-y-3">
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
      {preview && (
        <div className="w-24 h-32 rounded-sm overflow-hidden border border-primary/30">
          <img src={preview} alt="Generated poster" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};

export default PosterGenerator;
