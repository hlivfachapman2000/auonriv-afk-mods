import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AFKModule } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { Send, Bot, User, Sparkles, Terminal, Code2 } from 'lucide-react';

interface GeminiChatProps {
    onNewModule?: (module: Omit<AFKModule, 'id' | 'isActive'>) => void;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ onNewModule }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "Tactician Systems Online. I can generate new AFK scripts for you. Try asking: 'Create a module that presses E every 10 seconds'.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(history, userMsg.text);

      // Check for JSON block (AI Code Generation)
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      let finalText = responseText;
      let generatedModule = null;

      if (jsonMatch && jsonMatch[1]) {
          try {
              const data = JSON.parse(jsonMatch[1]);
              if (data.type === 'NEW_MODULE' && onNewModule) {
                  generatedModule = data;
                  onNewModule({
                      name: data.name,
                      description: data.description,
                      key: data.key,
                      interval: data.interval,
                      actionLogMessage: data.actionLogMessage
                  });
                  finalText = responseText.replace(/```json[\s\S]*```/, ''); // Hide JSON from chat
              }
          } catch (e) {
              console.error("Failed to parse AI module data");
          }
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: finalText.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

      if (generatedModule) {
          setMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              role: 'model',
              text: `SYSTEM: Compiled new module "${generatedModule.name}". It has been installed to your Dashboard.`,
              timestamp: new Date()
          }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Error connecting to Tactical Database. Please check your API Key configuration.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-800/30 rounded-xl border border-slate-700 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center gap-2">
        <Sparkles className="text-purple-400" size={20} />
        <h3 className="font-bold gamer-font text-lg text-gray-100">TACTICAL AI ADVISOR</h3>
        <div className="ml-auto flex items-center gap-2 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-500/20">
            <Code2 size={12} />
            <span>SCRIPT GENERATION ACTIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
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
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Command (e.g., 'Make a spam crouch module')"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-500 font-mono text-sm"
          />
          <button
            onClick={handleSend}
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