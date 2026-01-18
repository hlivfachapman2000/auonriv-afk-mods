import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AFKModule } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { Send, Bot, User, Sparkles, Terminal, Code2, Camera, Eye } from 'lucide-react';

interface GeminiChatProps {
    onNewModule?: (module: Omit<AFKModule, 'id' | 'isActive'>) => void;
    stream?: MediaStream | null;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ onNewModule, stream }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "Tactician Systems Online. I can generate scripts or analyze your screen. Click the Eye icon to let me see.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoCaptureRef = useRef<HTMLVideoElement>(document.createElement('video'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const captureFrame = async (): Promise<string | null> => {
      if (!stream) return null;
      
      const video = videoCaptureRef.current;
      video.srcObject = stream;
      
      // Wait for play
      try {
        await video.play();
      } catch (e) {
         // Already playing or error
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = 640; // Resize for bandwidth/AI speed
      canvas.height = 360;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Return base64 without prefix
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          return dataUrl.split(',')[1];
      }
      return null;
  };

  const handleSend = async (forcedImage?: boolean) => {
    if ((!input.trim() && !forcedImage) || isLoading) return;

    let base64Image = undefined;
    if (forcedImage && stream) {
        const img = await captureFrame();
        if (img) base64Image = img;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input || (forcedImage ? "Analyze this view." : ""),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (base64Image) {
        setMessages(prev => [...prev, {
            id: Date.now().toString() + "img",
            role: 'model',
            text: "Analyzing visual feed...",
            timestamp: new Date()
        }]);
    }

    try {
      const history = messages.filter(m => !m.isError).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(history, userMsg.text, base64Image);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Error connecting to Tactical Database.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800/30 rounded-xl border border-slate-700 backdrop-blur-md overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Sparkles className="text-purple-400" size={20} />
            <h3 className="font-bold gamer-font text-lg text-gray-100">TACTICAL AI</h3>
        </div>
        
        {stream && (
            <button 
                onClick={() => handleSend(true)}
                disabled={isLoading}
                className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 px-3 py-1 rounded text-xs font-bold border border-purple-500/50 transition-colors"
            >
                <Eye size={14} />
                SCAN SCREEN
            </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-cyan-600' : 'bg-purple-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-100 rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-900/20 border border-red-500/50 text-red-200'
                    : 'bg-slate-700/50 border border-slate-600 text-gray-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot size={16} />
                </div>
                <div className="p-3 bg-slate-700/30 rounded-2xl rounded-tl-none text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(false)}
            placeholder="Ask tactical advice..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-500 font-mono text-sm"
          />
          <button
            onClick={() => handleSend(false)}
            disabled={isLoading || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};