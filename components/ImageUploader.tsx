import React, { ChangeEvent, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  label: string;
  image: UploadedImage | null;
  onImageChange: (image: UploadedImage | null) => void;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageChange, id }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 data and mime type
      const base64Data = result.split(',')[1];
      const mimeType = result.split(';')[0].split(':')[1];

      onImageChange({
        file,
        previewUrl: result,
        base64Data,
        mimeType
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      
      <div 
        className={`relative w-full aspect-[4/3] rounded-xl border-2 border-dashed transition-all duration-300 group cursor-pointer overflow-hidden
          ${image 
            ? 'border-indigo-500 bg-slate-800' 
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-400 hover:bg-slate-800'
          }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          type="file"
          id={id}
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {image ? (
          <>
            <img 
              src={image.previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <p className="text-white font-medium text-sm">Change Image</p>
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors z-10"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="p-3 bg-slate-700/50 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
              <Upload size={24} className="text-indigo-400" />
            </div>
            <p className="text-sm font-medium">Click to upload</p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;