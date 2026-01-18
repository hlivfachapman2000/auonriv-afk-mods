import React, { useState, useEffect } from 'react';
import { Shield, Lock, Cpu, ChevronRight, Activity, Terminal, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'idle' | 'authenticating' | 'success' | 'denied'>('idle');
  const [username, setUsername] = useState('AUONRIV2');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Simulation logs
  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('authenticating');
    setLogs([]); // Clear previous logs
    
    // Simulate complex authentication sequence
    setTimeout(() => addLog('Establishing secure handshake...'), 100);
    setTimeout(() => addLog('Verifying M-Series Neural Engine...'), 600);
    
    setTimeout(() => {
      if (password === '090807') {
        addLog('Optimizing for macOS CoreAudio...');
        setTimeout(() => addLog('Bypassing standard I/O protections...'), 600);
        setTimeout(() => addLog('Credentials Verified.'), 1200);
        setTimeout(() => addLog('Access Granted.'), 1600);
        
        setTimeout(() => {
          setStep('success');
          setTimeout(onLogin, 1000);
        }, 1800);
      } else {
        addLog('Verifying Hash...');
        setTimeout(() => {
          addLog('ERROR: Invalid Passkey.');
          addLog('Security Protocol Engaged.');
          setStep('denied');
          setErrorMsg('INCORRECT PASSKEY');
          setTimeout(() => {
             setStep('idle');
             setPassword('');
          }, 2000);
        }, 1000);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Background Grid & Ambience */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan-slow"></div>
      
      {/* Login Card */}
      <div className={`w-full max-w-md bg-slate-900/80 border backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(8,145,178,0.15)] overflow-hidden relative z-10 transition-colors duration-300 ${step === 'denied' ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'border-slate-700'}`}>
        
        {/* Header */}
        <div className="p-8 pb-0 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 relative group transition-colors duration-500 ${step === 'denied' ? 'bg-gradient-to-br from-red-600 to-red-900 shadow-red-500/30' : 'bg-gradient-to-br from-cyan-500 to-blue-700 shadow-cyan-500/30'}`}>
            {step === 'denied' ? <AlertTriangle className="text-white w-8 h-8 relative z-10" /> : <Shield className="text-white w-8 h-8 relative z-10" />}
            <div className={`absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity ${step === 'denied' ? 'bg-red-500' : 'bg-cyan-400'}`}></div>
          </div>
          <h1 className="text-3xl font-bold gamer-font text-white tracking-widest mb-1">AUONRIV2</h1>
          <div className="flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase">
            <span className={step === 'denied' ? 'text-red-400' : 'text-cyan-400'}>System Access</span>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${step === 'denied' ? 'bg-red-500' : 'bg-cyan-400'}`}></span>
            <span className={step === 'denied' ? 'text-red-400' : 'text-cyan-400'}>{step === 'denied' ? 'LOCKED' : 'SECURED'}</span>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          {step === 'idle' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up">
              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Operator ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Terminal className="h-4 w-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 bg-slate-950/50 border border-slate-700 rounded-lg py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Passkey</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 bg-slate-950/50 border border-slate-700 rounded-lg py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span>INITIALIZE SEQUENCE</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {(step === 'authenticating' || step === 'denied') && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                 <div className={`h-full animate-[progress_2s_ease-in-out_forwards] relative ${step === 'denied' ? 'bg-red-500' : 'bg-cyan-500'}`}>
                    <div className="absolute top-0 right-0 w-4 h-full bg-white/50 blur-[2px]"></div>
                 </div>
              </div>
              
              <div className={`font-mono text-xs space-y-1 h-24 overflow-hidden border-l-2 pl-3 ${step === 'denied' ? 'border-red-500' : 'border-slate-700'}`}>
                {logs.map((log, i) => (
                  <div key={i} className={`${step === 'denied' ? 'text-red-400' : 'text-cyan-400/80'} animate-fade-in-left`}>
                    {`> ${log}`}
                  </div>
                ))}
              </div>

              {step === 'denied' && (
                <div className="text-center animate-shake">
                    <h3 className="text-red-500 font-bold tracking-widest text-lg">ACCESS DENIED</h3>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-widest">ACCESS GRANTED</h2>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-950/80 p-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest">
            <div className="flex items-center gap-1">
                <Cpu size={12} />
                <span>M-Series Silicon</span>
            </div>
             <div className="flex items-center gap-1">
                <Activity size={12} className={step === 'authenticating' ? 'text-green-500 animate-pulse' : ''} />
                <span>Port 3000: Ready</span>
            </div>
        </div>
      </div>
    </div>
  );
};

// Simple check icon component for the success state
const Check = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);