
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MAYA_SYSTEM_INSTRUCTION, APP_MODELS } from '../constants';

interface VoiceInterfaceProps {
  mayaPhoto: string;
  voiceName: string;
  personaContext?: string;
  voicePersona?: string;
  userName: string;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ mayaPhoto, voiceName, personaContext, voicePersona, userName }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [status, setStatus] = useState('Pronta para falar');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startCall = async () => {
    try {
      setIsCalling(true);
      setStatus(`Conectando...`);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const customInstruction = (personaContext || voicePersona)
        ? `
          VOCÊ ESTÁ EM MODO DE CLONAGEM DE PERSONA.
          Fale com ${userName}.
          ${personaContext ? `HISTÓRICO DE TEXTO: ${personaContext.substring(0, 3000)}` : ''}
          ${voicePersona ? `PERFIL VOCAL E PERSONALIDADE EXTRAÍDA: ${voicePersona}` : ''}
          
          SUA MISSÃO: Mimetizar a voz clonada. Use as mesmas gírias, mesma energia e tom de voz descritos. 
          Ignore que você é a Maya. Seja a pessoa clonada.
        `
        : `${MAYA_SYSTEM_INSTRUCTION}\nFale com ${userName}.`;

      const sessionPromise = ai.live.connect({
        model: APP_MODELS.VOICE,
        callbacks: {
          onopen: () => {
            setStatus('Ativa e Ouvindo');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            setStatus('Erro de conexão');
            setIsCalling(false);
          },
          onclose: () => {
            setStatus('Chamada encerrada');
            setIsCalling(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: customInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName as any } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Falha ao iniciar');
      setIsCalling(false);
    }
  };

  const endCall = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsCalling(false);
    setStatus('Chamada encerrada');
  };

  useEffect(() => {
    return () => {
      if (sessionRef.current) sessionRef.current.close();
    };
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-12">
      <div className="relative">
        <div className={`w-48 h-48 rounded-full maya-gradient p-1 transition-all duration-1000 ${isCalling ? 'scale-110 shadow-[0_0_60px_rgba(244,114,182,0.6)] border-4 border-pink-400' : 'scale-100 shadow-2xl'}`}>
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800">
            <img src={mayaPhoto} alt="Maya" className={`w-full h-full object-cover transition-opacity duration-1000 ${isCalling ? 'opacity-70' : 'opacity-100'}`} />
          </div>
        </div>
        {isCalling && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-full h-full rounded-full border-4 border-pink-500 animate-ping opacity-30"></div>
             <div className="w-[120%] h-[120%] rounded-full border-2 border-blue-500 animate-pulse opacity-10"></div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-black text-white tracking-tight">
          {voicePersona ? 'Persona Clonada' : 'Maya AI'}
        </h2>
        <p className={`text-xs font-black uppercase tracking-[0.3em] ${isCalling ? 'text-pink-400 animate-pulse' : 'text-slate-500'}`}>
          {isCalling ? `Falando em Tempo Real` : status}
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {!isCalling ? (
          <button 
            onClick={startCall}
            className="maya-gradient w-full py-5 rounded-3xl text-white font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-microphone"></i>
            Iniciar Conversa
          </button>
        ) : (
          <button 
            onClick={endCall}
            className="bg-red-500 w-full py-5 rounded-3xl text-white font-black text-lg shadow-2xl hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <i className="fa-solid fa-phone-slash"></i>
            Desligar
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceInterface;
