import React from 'react';
import { Download, Share2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface ResultViewerProps {
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

const ResultViewer: React.FC<ResultViewerProps> = ({ imageUrl, loading, error }) => {
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `gemini-faceswap-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-red-900/10 border border-red-800/50 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-red-200 mb-2">Generation Failed</h3>
        <p className="text-red-300/80 max-w-xs text-sm">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-slate-800/30 border border-slate-700 rounded-2xl relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Generating Magic...</h3>
          <p className="text-slate-400 text-sm max-w-xs text-center">
            Gemini is analyzing features and blending the images. This might take a few seconds.
          </p>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-slate-800/30 border border-slate-700 rounded-2xl border-dashed">
        <Sparkles className="w-16 h-16 text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-400 mb-2">Ready to Create</h3>
        <p className="text-slate-500 text-sm text-center max-w-xs">
          Upload your source and target images, then click "Swap Faces" to see the result here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-500">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black">
        <img 
          src={imageUrl} 
          alt="Face Swap Result" 
          className="w-full h-auto max-h-[600px] object-contain mx-auto"
        />
      </div>
      
      <div className="flex gap-3 justify-end">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Download size={18} />
          Download
        </button>
      </div>
    </div>
  );
};

export default ResultViewer;