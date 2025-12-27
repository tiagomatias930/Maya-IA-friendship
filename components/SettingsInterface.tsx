
import React, { useRef, useState } from 'react';
import { analyzeVoiceSample } from '../services/geminiService';

interface SettingsInterfaceProps {
  onSelectKey: () => void;
  hasKey: boolean;
  mayaPhoto: string;
  onPhotoChange: (photo: string) => void;
  mayaVoice: string;
  onVoiceChange: (voice: string) => void;
  personaContext: string;
  onPersonaChange: (context: string) => void;
  voicePersona: string;
  onVoicePersonaChange: (profile: string) => void;
  isCloning: boolean;
  setIsCloning: (val: boolean) => void;
  userName: string;
  userPhoto: string;
  partnerName: string;
  onUserUpdate: (name: string, partnerName: string, photo: string) => void;
}

const SettingsInterface: React.FC<SettingsInterfaceProps> = ({ 
  onSelectKey, 
  hasKey, 
  mayaPhoto, 
  onPhotoChange,
  mayaVoice,
  onVoiceChange,
  personaContext,
  onPersonaChange,
  voicePersona,
  onVoicePersonaChange,
  isCloning,
  setIsCloning,
  userName,
  userPhoto,
  partnerName,
  onUserUpdate
}) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);
  const whatsappInputRef = useRef<HTMLInputElement>(null);
  const userPhotoRef = useRef<HTMLInputElement>(null);
  const [cloningProgress, setCloningProgress] = useState(0);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onPhotoChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUserPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUserUpdate(userName, partnerName, reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCloning(true);
      setCloningProgress(10);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          const profile = await analyzeVoiceSample(base64, file.type);
          onVoicePersonaChange(profile);
          setIsCloning(false);
        } catch (err) {
          alert("Erro ao clonar voz.");
          setIsCloning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWhatsAppUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => onPersonaChange(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6 space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-black text-white">Definições</h2>
        <p className="text-slate-400 text-sm">Gerencie o casal e a alma da IA.</p>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-4 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Dados do Casal</p>
          <div className="flex flex-col gap-4">
             <div onClick={() => userPhotoRef.current?.click()} className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 mx-auto cursor-pointer relative group">
              {userPhoto ? <img src={userPhoto} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center"><i className="fa-solid fa-user"></i></div>}
              <input type="file" ref={userPhotoRef} className="hidden" accept="image/*" onChange={handleUserPhotoUpload} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 ml-1">VOCÊ</label>
                <input type="text" value={userName} onChange={(e) => onUserUpdate(e.target.value, partnerName, userPhoto)} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-white font-bold text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-pink-500 ml-1">PARCEIRO/A</label>
                <input type="text" value={partnerName} onChange={(e) => onUserUpdate(userName, e.target.value, userPhoto)} className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-white font-bold text-xs" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-4 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400">Aparência de {partnerName}</p>
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-pink-500/30">
                <img src={mayaPhoto} className="w-full h-full object-cover" alt="Maya" />
              </div>
              <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">Mude a foto que {partnerName} usa no perfil.</p>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <i className="fa-brands fa-whatsapp text-emerald-400"></i>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Clonagem WhatsApp</p>
          </div>
          <button onClick={() => whatsappInputRef.current?.click()} className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700 border-dashed">
            {personaContext ? 'Estilo de Texto Ativo ✓' : 'Importar Conversa (.txt)'}
          </button>
          <input type="file" ref={whatsappInputRef} className="hidden" accept=".txt" onChange={handleWhatsAppUpload} />
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-white/5 space-y-4">
          <button onClick={onSelectKey} className="w-full py-4 bg-slate-800 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest">
            {hasKey ? 'Configurações de API OK' : 'Conectar Gemini'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsInterface;
