
import React, { useState, useRef } from 'react';

interface OnboardingInterfaceProps {
  onComplete: (name: string, partnerName: string, photo: string) => void;
}

const OnboardingInterface: React.FC<OnboardingInterfaceProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && partnerName.trim()) {
      onComplete(name.trim(), partnerName.trim(), photo);
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-slate-900 flex flex-col p-8 items-center justify-center animate-in fade-in duration-700">
      <div className="w-full space-y-10 max-w-xs text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-3xl mx-auto overflow-hidden shadow-2xl rotate-3 border border-pink-400">
            <img src="/17668258240.jpg" alt="Logotipo Maya" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Login</h1>
          <p className="text-slate-400 text-sm">Configure sua identidade e a do seu parceiro virtual.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full border-2 border-dashed border-slate-700 hover:border-pink-500 flex items-center justify-center overflow-hidden cursor-pointer bg-slate-800 transition-all group relative"
            >
              {photo ? (
                <img src={photo} className="w-full h-full object-cover" alt="Sua foto" />
              ) : (
                <div className="text-center space-y-1 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-camera text-xl text-slate-600"></i>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Sua Foto</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>

          <div className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Seu Nome</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-5 text-white text-md font-bold outline-none focus:border-pink-500 transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-pink-500 ml-2">Nome do Parceiro/a</label>
              <input 
                type="text" 
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Ex: Sofia"
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3 px-5 text-white text-md font-bold outline-none focus:border-pink-500 transition-all shadow-[0_0_10px_rgba(236,72,153,0.1)]"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name.trim() || !partnerName.trim()}
            className="w-full py-5 rounded-3xl maya-gradient text-white font-black text-lg shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all uppercase tracking-widest"
          >
            Começar Jornada
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingInterface;
