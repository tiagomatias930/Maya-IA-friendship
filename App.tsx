
import React, { useState, useEffect } from 'react';
import { View, ChatMessage } from './types';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import CreationInterface from './components/CreationInterface';
import SettingsInterface from './components/SettingsInterface';
import OnboardingInterface from './components/OnboardingInterface';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.CHAT);
  const [hasKey, setHasKey] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  
  // User Data
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState<string>("");

  // Partner Data
  const [partnerName, setPartnerName] = useState("Maya");
  const [mayaPhoto, setMayaPhoto] = useState<string>("/icons/1766825824036.jpg");
  
  // Customization & History
  const [mayaVoice, setMayaVoice] = useState<string>("Kore");
  const [personaContext, setPersonaContext] = useState<string>("");
  const [voicePersona, setVoicePersona] = useState<string>(""); 
  const [isCloningVoice, setIsCloningVoice] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const savedName = localStorage.getItem('maya_user_name');
    const savedPartner = localStorage.getItem('maya_partner_name');
    const savedPhoto = localStorage.getItem('maya_user_photo');
    const savedMayaPhoto = localStorage.getItem('maya_profile_photo');
    const savedHistory = localStorage.getItem('maya_chat_history');

    if (savedName) {
      setUserName(savedName);
      setPartnerName(savedPartner || "Maya");
      setUserPhoto(savedPhoto || "");
      if (savedMayaPhoto) setMayaPhoto(savedMayaPhoto);
      if (savedHistory) setChatHistory(JSON.parse(savedHistory));
      setIsOnboarded(true);
    }

    const checkKey = async () => {
      if (typeof window.aistudio?.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  // Salvar histórico sempre que mudar
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('maya_chat_history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleOnboardingComplete = (name: string, pName: string, photo: string) => {
    setUserName(name);
    setPartnerName(pName);
    setUserPhoto(photo);
    localStorage.setItem('maya_user_name', name);
    localStorage.setItem('maya_partner_name', pName);
    localStorage.setItem('maya_user_photo', photo);
    setIsOnboarded(true);
  };

  const handleOpenKeyDialog = async () => {
    if (typeof window.aistudio?.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  if (!isOnboarded) {
    return <OnboardingInterface onComplete={handleOnboardingComplete} />;
  }

  const renderView = () => {
    switch (activeView) {
      case View.CHAT:
        return (
          <ChatInterface 
            mayaPhoto={mayaPhoto} 
            personaContext={personaContext} 
            voicePersona={voicePersona} 
            userName={userName}
            partnerName={partnerName}
            history={chatHistory}
            onHistoryChange={setChatHistory}
          />
        );
      case View.VOICE:
        return (
          <VoiceInterface 
            mayaPhoto={mayaPhoto} 
            voiceName={mayaVoice} 
            personaContext={personaContext}
            voicePersona={voicePersona}
            userName={userName}
            partnerName={partnerName}
          />
        );
      case View.CREATION:
        return <CreationInterface />;
      case View.SETTINGS:
        return (
          <SettingsInterface 
            onSelectKey={handleOpenKeyDialog} 
            hasKey={hasKey} 
            mayaPhoto={mayaPhoto}
            onPhotoChange={(p) => {
              setMayaPhoto(p);
              localStorage.setItem('maya_profile_photo', p);
            }}
            mayaVoice={mayaVoice}
            onVoiceChange={setMayaVoice}
            personaContext={personaContext}
            onPersonaChange={setPersonaContext}
            voicePersona={voicePersona}
            onVoicePersonaChange={setVoicePersona}
            isCloning={isCloningVoice}
            setIsCloning={setIsCloningVoice}
            userName={userName}
            userPhoto={userPhoto}
            partnerName={partnerName}
            onUserUpdate={(name, pName, photo) => {
              setUserName(name);
              setPartnerName(pName);
              setUserPhoto(photo);
              localStorage.setItem('maya_user_name', name);
              localStorage.setItem('maya_partner_name', pName);
              localStorage.setItem('maya_user_photo', photo);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-slate-900 border-x border-slate-800 shadow-2xl">
      <header className="p-4 glass-panel flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full maya-gradient border-2 border-pink-400 overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer" onClick={() => setActiveView(View.SETTINGS)}>
            <img src={mayaPhoto} alt={partnerName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">
              {partnerName}
            </h1>
            <span className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Conectada com {userName}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setActiveView(View.SETTINGS)}
          className={`p-2 rounded-full transition-all ${activeView === View.SETTINGS ? 'bg-pink-500 text-white rotate-90 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'text-slate-400 hover:bg-white/10'}`}
        >
          <i className="fa-solid fa-gear"></i>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 relative bg-slate-900/50">
        {renderView()}
      </main>

      <nav className="absolute bottom-6 left-4 right-4 h-16 glass-panel rounded-2xl flex items-center justify-around px-4 z-20 shadow-2xl border border-white/5">
        <NavItem icon="fa-message" label="Chat" active={activeView === View.CHAT} onClick={() => setActiveView(View.CHAT)} />
        <NavItem icon="fa-microphone" label="Voz" active={activeView === View.VOICE} onClick={() => setActiveView(View.VOICE)} />
        <NavItem icon="fa-sparkles" label="Estúdio" active={activeView === View.CREATION} onClick={() => setActiveView(View.CREATION)} />
      </nav>
    </div>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${active ? 'text-pink-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
    <i className={`fa-solid ${icon} text-lg`}></i>
    <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
