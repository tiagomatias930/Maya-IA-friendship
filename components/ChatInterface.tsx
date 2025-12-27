
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatInterfaceProps {
  mayaPhoto: string;
  personaContext: string;
  voicePersona: string;
  userName: string;
  partnerName: string;
  history: ChatMessage[];
  onHistoryChange: (history: ChatMessage[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  mayaPhoto, personaContext, voicePersona, userName, partnerName, history, onHistoryChange 
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewOnceMode, setViewOnceMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
      isViewOnce: viewOnceMode
    };

    const newHistory = [...history, userMsg];
    onHistoryChange(newHistory);
    setInput('');
    setIsLoading(true);
    setViewOnceMode(false); // Reseta após o envio

    try {
      // Ajuste no prompt para respeitar o nome customizado
      const response = await sendChatMessage(text, personaContext, voicePersona, userName);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "...",
        timestamp: Date.now()
      };
      onHistoryChange([...newHistory, modelMsg]);
    } catch (error) {
      console.error(error);
      onHistoryChange([...newHistory, {
        id: Date.now().toString(),
        role: 'model',
        text: "Desculpe, tive um probleminha. Podemos tentar de novo?",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const openViewOnce = (msgId: string) => {
    onHistoryChange(history.map(m => 
      m.id === msgId ? { ...m, isOpened: true } : m
    ));
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <i className="fa-solid fa-comments text-4xl mb-4"></i>
            <p className="text-sm font-bold">Nenhuma conversa ainda.<br/>Que tal dar um oi para {partnerName}?</p>
          </div>
        )}
        
        {history.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-400 flex-shrink-0 mt-1 shadow-md">
                <img src={mayaPhoto} alt={partnerName} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl p-3 shadow-md relative group ${
              msg.role === 'user' 
              ? 'bg-pink-500 text-white rounded-tr-none' 
              : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
            }`}>
              {msg.isViewOnce ? (
                msg.isOpened ? (
                  <div className="flex items-center gap-2 text-[11px] font-bold py-1 px-2 italic opacity-60">
                    <i className="fa-solid fa-circle-check"></i>
                    Visualizada
                  </div>
                ) : (
                  <button 
                    onClick={() => openViewOnce(msg.id)}
                    className="flex items-center gap-3 py-1 pr-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <i className="fa-solid fa-circle-nodes text-xs"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black uppercase tracking-widest">Foto / Mensagem</p>
                      <p className="text-[10px] opacity-70">Visualização Única</p>
                    </div>
                  </button>
                )
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              )}
              
              <span className="text-[9px] opacity-40 block mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-start gap-2 animate-pulse">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-pink-400 mt-1">
              <img src={mayaPhoto} alt={partnerName} className="w-full h-full object-cover" />
            </div>
            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
               <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md p-1.5 rounded-full border border-white/5 shadow-2xl flex items-center gap-2 transition-all focus-within:ring-2 ring-pink-500/30">
        <button 
          onClick={() => setViewOnceMode(!viewOnceMode)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${viewOnceMode ? 'bg-blue-500 text-white shadow-[0_0_15px_#3b82f6]' : 'text-slate-400 hover:bg-slate-700'}`}
          title="Modo Visualização Única"
        >
          <div className="relative">
            <i className="fa-solid fa-circle-dot text-lg"></i>
            <span className="absolute -top-1 -right-1 text-[8px] bg-white text-black font-black rounded-full w-3 h-3 flex items-center justify-center">1</span>
          </div>
        </button>
        
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder={viewOnceMode ? "Envie algo secreto..." : "Digite uma mensagem..."}
          className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-slate-100 placeholder:text-slate-500"
        />
        
        <button 
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 maya-gradient rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:grayscale transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
