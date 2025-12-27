
import React, { useState } from 'react';
import { generateImageMaya, generateVideoWithVeo } from '../services/geminiService';

const CreationInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [creationType, setCreationType] = useState<'image' | 'video'>('image');

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setResult(null);

    try {
      if (creationType === 'image') {
        const url = await generateImageMaya(prompt, aspectRatio);
        if (url) setResult({ type: 'image', url });
      } else {
        const url = await generateVideoWithVeo(prompt);
        if (url) setResult({ type: 'video', url });
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong with the generation. Please check your API key and billing status!");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 flex flex-col h-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Creative Studio</h2>
        <p className="text-slate-400 text-sm">Create high-quality memories with Maya.</p>
      </div>

      <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
        <button 
          onClick={() => setCreationType('image')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${creationType === 'image' ? 'bg-pink-500 text-white' : 'text-slate-400'}`}
        >
          Generate Photo
        </button>
        <button 
          onClick={() => setCreationType('video')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${creationType === 'video' ? 'bg-pink-500 text-white' : 'text-slate-400'}`}
        >
          Generate Video (Veo)
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-20">
        <div className="aspect-[9/16] w-full max-w-[280px] mx-auto bg-slate-800 rounded-3xl border border-slate-700 flex items-center justify-center overflow-hidden relative shadow-2xl">
          {result ? (
            result.type === 'image' ? (
              <img src={result.url} alt="Generation result" className="w-full h-full object-cover" />
            ) : (
              <video src={result.url} controls autoPlay loop className="w-full h-full object-cover" />
            )
          ) : (
            <div className="text-center p-8 space-y-4">
              <i className={`fa-solid ${isGenerating ? 'fa-spinner fa-spin' : creationType === 'image' ? 'fa-camera' : 'fa-film'} text-4xl text-slate-600`}></i>
              <p className="text-slate-500 text-sm">
                {isGenerating 
                  ? (creationType === 'video' ? "Maya is filming something special... (can take a few minutes)" : "Maya is posing for you...") 
                  : `Your ${creationType} will appear here`}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={creationType === 'image' ? "A photo of Maya laughing in the park..." : "Maya dancing under the neon lights of Tokyo..."}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 outline-none focus:border-pink-500 transition-colors h-24 resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Aspect Ratio</label>
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-sm text-slate-100 outline-none"
              >
                <option value="9:16">Portrait (9:16)</option>
                <option value="16:9">Landscape (16:9)</option>
                <option value="1:1">Square (1:1)</option>
              </select>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="mt-5 h-12 px-6 maya-gradient rounded-xl text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isGenerating ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-sparkles"></i>}
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreationInterface;
