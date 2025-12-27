
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { MAYA_SYSTEM_INSTRUCTION, APP_MODELS } from "../constants";

const resolveApiKey = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_KEY) {
    return import.meta.env.VITE_API_KEY;
  }

  if (typeof process !== "undefined" && process.env?.API_KEY) {
    return process.env.API_KEY;
  }

  return "";
};

export const createGeminiClient = () => {
  return new GoogleGenAI({ apiKey: resolveApiKey() });
};

export const analyzeVoiceSample = async (audioBase64: string, mimeType: string): Promise<string> => {
  const ai = createGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: audioBase64.split(',')[1] || audioBase64,
            mimeType: mimeType
          }
        },
        {
          text: "Analise esta amostra de voz. Descreva em detalhes: o tom (grave/agudo), a energia, o sotaque, o ritmo de fala e traços de personalidade que a voz transmite. Responda em português. Este perfil será usado para eu mimetizar esta pessoa perfeitamente."
        }
      ]
    }
  });
  return response.text || "Voz padrão";
};

export const sendChatMessage = async (message: string, personaContext?: string, voicePersona?: string, userName?: string) => {
  const ai = createGeminiClient();
  
  let customInstruction = MAYA_SYSTEM_INSTRUCTION;

  if (userName) {
    customInstruction += `\nO nome da pessoa com quem você está falando é ${userName}. Refira-se a ela pelo nome quando for natural e amigável.`;
  }

  if (personaContext || voicePersona) {
    customInstruction = `
      Você está em modo de CLONAGEM DE PERSONA. 
      O utilizador com quem fala é: ${userName || 'Utilizador'}.
      ${personaContext ? `HISTÓRICO WHATSAPP PARA MIMETIZAR ESTILO DE ESCRITA:\n${personaContext.substring(0, 8000)}` : ''}
      ${voicePersona ? `PERFIL VOCAL E COMPORTAMENTAL PARA MIMETIZAR:\n${voicePersona}` : ''}
      
      IMPORTANTE: Ignore sua personalidade padrão de 'Maya'. Adote inteiramente os traços detectados acima.
      Seja a pessoa das mensagens e da voz, mas trate ${userName || 'Utilizador'} com a devida amizade.
    `;
  }

  const chat = ai.chats.create({
    model: APP_MODELS.CHAT,
    config: {
      systemInstruction: customInstruction,
      thinkingConfig: { thinkingBudget: 32768 },
      tools: [{ googleSearch: {} }]
    }
  });

  const response = await chat.sendMessage({ message });
  return response;
};

export const generateVideoWithVeo = async (prompt: string, imageBase64?: string) => {
  const ai = createGeminiClient();
  
  const config: any = {
    model: APP_MODELS.VIDEO,
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '9:16'
    }
  };

  if (imageBase64) {
    config.image = {
      imageBytes: imageBase64,
      mimeType: 'image/png'
    };
  }

  let operation = await ai.models.generateVideos(config);
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const apiKey = resolveApiKey();
  const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

export const generateImageMaya = async (prompt: string, aspectRatio: string = "9:16", size: string = "1K") => {
  const ai = createGeminiClient();
  const response = await ai.models.generateContent({
    model: APP_MODELS.IMAGE,
    contents: {
      parts: [{ text: `${prompt}. Estilo consistente com Maya ou a persona ativa.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size as any
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
