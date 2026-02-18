import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoUploaderProps {
  onPhotoSelected: (file: File | null) => void;
}

export default function PhotoUploader({ onPhotoSelected }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onPhotoSelected(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="photo-upload"
      />

      {!preview ? (
        <label htmlFor="photo-upload">
          <Card className="border-2 border-dashed cursor-pointer hover:border-primary transition-colors">
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">Click to upload photo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </Card>
        </label>
      ) : (
        <Card className="relative overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      )}

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <ImageIcon className="h-3 w-3" />
        Photo evidence is required for all complaints
      </p>
    </div>
  );
}
