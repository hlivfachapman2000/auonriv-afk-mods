
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  ANALYZER = 'ANALYZER',
  MACROS = 'MACROS',
  SETTINGS = 'SETTINGS',
}

export interface AnalysisResult {
  text: string;
  timestamp: Date;
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'action' | 'warning';
  timestamp: string;
}

export interface AFKModule {
  id: string;
  name: string;
  description: string;
  key: string;
  interval: number;
  isActive: boolean;
  actionLogMessage: string;
}

export interface MacroAction {
  id: string;
  type: 'MOVE' | 'CLICK' | 'KEY';
  key?: string; // For keyboard events (e.g., "SPACE", "E")
  x: number;
  y: number;
  delay: number;
}
