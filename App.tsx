import React, { useState } from 'react';
import { UploadedImage } from './types';
import { generateFaceSwap } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ResultViewer from './components/ResultViewer';
import { Sparkles, Zap, Aperture, Key, AlertTriangle, Monitor, Smartphone, Square, Layout, Palette, Sun, Moon, Move, ZoomIn, ZoomOut, Maximize, Settings, X, CheckCircle, Eye, EyeOff } from 'lucide-react';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<UploadedImage | null>(null);
  const [targetImage, setTargetImage] = useState<UploadedImage | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [imageSize, setImageSize] = useState<string>("2K");
  const [skinTone, setSkinTone] = useState<string>("match_target");
  const [lightingMode, setLightingMode] = useState<string>("natural");
  const [faceScale, setFaceScale] = useState<string>("default");
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth State
  const [userApiKey, setUserApiKey] = useState<string>("");
  const hasEnvKey = process.env.API_KEY && process.env.API_KEY.length > 0;
  const isKeyReady = hasEnvKey || userApiKey.length > 0;
  
  // UI State
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false);

  const handleOpenConfig = () => {
    setTempApiKey(userApiKey);
    setShowConfigModal(true);
  };

  const handleSaveKey = () => {
    setUserApiKey(tempApiKey.trim());
    setShowConfigModal(false);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!isKeyReady) {
      handleOpenConfig();
      return;
    }
    
    if (!sourceImage || !targetImage) return;

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultUrl = await generateFaceSwap(
        sourceImage, 
        targetImage, 
        customPrompt, 
        aspectRatio, 
        imageSize,
        skinTone,
        lightingMode,
        faceScale,
        userApiKey // Pass the manually entered key
      );
      setGeneratedImage(resultUrl);
    } catch (err: any) {
      console.error(err);
      
      const errorMessage = err.message || JSON.stringify(err) || "An unexpected error occurred.";
      const errorString = errorMessage.toLowerCase();
      
      // Check for permission denied, 403, or missing key issues
      const isAuthError = 
        errorString.includes("permission") || 
        errorString.includes("permission_denied") || 
        errorString.includes("403") ||
        errorString.includes("api key") ||
        errorString.includes("requested entity was not found");

      if (isAuthError) {
        setError("Invalid API Key. Please check your key in settings.");
        setShowConfigModal(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const isReady = sourceImage !== null && targetImage !== null;

  const ratios = [
    { label: '1:1', value: '1:1', icon: Square },
    { label: '3:4', value: '3:4', icon: Smartphone },
    { label: '4:3', value: '4:3', icon: Layout },
    { label: '9:16', value: '9:16', icon: Smartphone },
    { label: '16:9', value: '16:9', icon: Monitor },
  ];

  const resolutions = [
    { label: '1K', value: '1K', desc: 'Fast' },
    { label: '2K', value: '2K', desc: 'Balanced' },
    { label: '4K', value: '4K', desc: 'Ultra' },
  ];

  const skinTones = [
    { label: 'Match Body', value: 'match_target', desc: 'Best Blend' },
    { label: 'Orig. Face', value: 'preserve_source', desc: 'Keep Tone' },
    { label: 'Lighter', value: 'lighter', desc: 'Bright' },
    { label: 'Darker', value: 'darker', desc: 'Deep' },
  ];

  const lightingModes = [
    { label: 'Natural', value: 'natural', icon: Sparkles },
    { label: 'Warm', value: 'warm', icon: Sun },
    { label: 'Cool', value: 'cool', icon: Moon },
    { label: 'Drama', value: 'contrast', icon: Zap },
  ];
  
  const faceScales = [
    { label: 'Smaller', value: 'smaller', icon: ZoomOut },
    { label: 'Auto Fit', value: 'default', icon: Maximize },
    { label: 'Larger', value: 'larger', icon: ZoomIn },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-yellow-500 bg-yellow-400 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-lg shadow-sm">
              <Aperture className="text-yellow-400 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Gemini Face Swap Pro
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={handleOpenConfig}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shadow-sm
                ${isKeyReady 
                    ? 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800' 
                    : 'bg-red-600 text-white border-red-700 hover:bg-red-700 animate-pulse'
                }`}
              title="Configure API Key"
            >
              <Key size={14} />
              <span>
                {isKeyReady ? 'API Key Configured' : 'Enter API Key'}
              </span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1 bg-slate-900/10 text-slate-900 rounded-full border border-slate-900/20">
              <Zap size={14} className="fill-slate-900" />
              <span>Gemini 3 Pro</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-xs text-white">1</span>
                  Upload Images
                </h2>
                
                <div className="space-y-6">
                  <ImageUploader 
                    id="source-upload"
                    label="Source Face (The Face)" 
                    image={sourceImage} 
                    onImageChange={setSourceImage} 
                  />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-slate-800 px-2 text-sm text-slate-500">swaps to</span>
                    </div>
                  </div>

                  <ImageUploader 
                    id="target-upload"
                    label="Target Body (The Scene)" 
                    image={targetImage} 
                    onImageChange={setTargetImage} 
                  />
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-xs text-white">2</span>
                  Refine & Generate
                </h2>
                <div className="space-y-5">
                  {/* Aspect Ratio */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-5 gap-2">
                      {ratios.map((ratio) => {
                        const Icon = ratio.icon;
                        return (
                          <button
                            key={ratio.value}
                            onClick={() => setAspectRatio(ratio.value)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 ${
                              aspectRatio === ratio.value
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                            title={ratio.label}
                          >
                            <Icon size={18} className="mb-1" />
                            <span className="text-[10px] font-medium">{ratio.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resolution */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Resolution (Quality)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {resolutions.map((res) => (
                        <button
                          key={res.value}
                          onClick={() => setImageSize(res.value)}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${
                            imageSize === res.value
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                              : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {res.value}
                          <span className="opacity-50 font-normal hidden sm:inline">| {res.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Face Scale */}
                  <div>
                     <label className="text-sm font-medium text-slate-300 block mb-2 flex items-center gap-2">
                       <Move size={14} /> Face Scale
                     </label>
                     <div className="grid grid-cols-3 gap-2">
                       {faceScales.map((scale) => {
                         const Icon = scale.icon;
                         return (
                            <button
                             key={scale.value}
                             onClick={() => setFaceScale(scale.value)}
                             className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${
                               faceScale === scale.value
                                 ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                 : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                             }`}
                            >
                               <Icon size={14} />
                               {scale.label}
                            </button>
                         )
                       })}
                     </div>
                  </div>

                  {/* Color & Tone */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2 flex items-center gap-2">
                      <Palette size={14} /> Color & Tone
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                       {/* Skin Tone Selector */}
                       <div className="col-span-2 grid grid-cols-4 gap-2">
                          {skinTones.map((tone) => (
                             <button
                              key={tone.value}
                              onClick={() => setSkinTone(tone.value)}
                              className={`flex flex-col items-center p-2 rounded-lg border text-[10px] transition-all duration-200
                                ${skinTone === tone.value
                                  ? 'bg-orange-500/20 border-orange-500 text-orange-200'
                                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                }
                              `}
                             >
                                <span className="font-semibold">{tone.label}</span>
                                <span className="opacity-60 text-[9px]">{tone.desc}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                    
                    {/* Lighting Mode */}
                    <div className="grid grid-cols-4 gap-2">
                       {lightingModes.map((mode) => {
                         const Icon = mode.icon;
                         return (
                           <button
                             key={mode.value}
                             onClick={() => setLightingMode(mode.value)}
                             className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] transition-all duration-200
                               ${lightingMode === mode.value
                                 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                                 : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                               }
                             `}
                           >
                              <Icon size={14} className="mb-1" />
                              <span>{mode.label}</span>
                           </button>
                         )
                       })}
                    </div>
                  </div>

                  {/* Prompt */}
                  <div>
                    <label htmlFor="prompt" className="text-sm font-medium text-slate-300 block mb-2">
                      Custom Instructions
                    </label>
                    <textarea
                      id="prompt"
                      rows={2}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="E.g., Make the expression happier, remove glasses..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Button on Mobile, normal on Desktop */}
            <div className="sticky bottom-4 lg:static z-40">
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-200 text-sm animate-in slide-in-from-top-2">
                  <AlertTriangle size={16} className="shrink-0 text-red-400" />
                  <p>{error}</p>
                </div>
              )}
              
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300
                  ${loading 
                    ? 'bg-slate-700 text-slate-400 cursor-wait border border-slate-600' 
                    : (!isReady)
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : (!isKeyReady)
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/25 animate-pulse'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25 transform hover:-translate-y-1'
                  }`}
              >
                {loading ? (
                  <>Processing...</>
                ) : (!isKeyReady) ? (
                  <>
                    <Key size={20} />
                    Enter API Key to Start
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Swap Faces ({imageSize})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <div className="bg-slate-800/50 rounded-2xl p-1 border border-slate-700/50 shadow-2xl h-full min-h-[500px]">
                <ResultViewer 
                  imageUrl={generatedImage} 
                  loading={loading} 
                  error={error} 
                />
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                 <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Privacy</h3>
                    <p className="text-slate-200 text-sm">Images are processed in memory and not stored.</p>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                    <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Quality</h3>
                    <p className="text-slate-200 text-sm">Powered by Gemini 3 Pro (Nano Banana Pro)</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative ring-1 ring-slate-700/50">
            <button 
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Settings className="text-indigo-400 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                API Key Configuration
              </h3>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Enter your Google Gemini API Key below. This key is used directly from your browser to the Google API and is not stored on any server.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                  Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="w-full bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all pr-12 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors border border-slate-700 flex items-center gap-2"
              >
                Get API Key <Key size={12} />
              </a>
              <button
                onClick={handleSaveKey}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Save & Use
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;