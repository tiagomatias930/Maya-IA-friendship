
export enum View {
  CHAT = 'CHAT',
  VOICE = 'VOICE',
  CREATION = 'CREATION',
  SETTINGS = 'SETTINGS'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingUrls?: { uri: string; title: string }[];
  isViewOnce?: boolean;
  isOpened?: boolean;
}

export interface VideoGenerationStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export interface ImageGenerationParams {
  prompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  size: "1K" | "2K" | "4K";
}
