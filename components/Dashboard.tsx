import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, AFKModule } from '../types';
import { Activity, Play, Square, Cpu, Wifi, ShieldAlert, Crosshair, RefreshCw, Eye, Zap, Cast, Terminal, Power, MousePointer2 } from 'lucide-react';

interface DashboardProps {
  logs: LogEntry[];
  addLog: (msg: string, type: 'info' | 'action' | 'warning') => void;
  customModules?: AFKModule[];
  toggleModule?: (id: string) => void;
  liveStream: MediaStream | null;
  setLiveStream: (stream: MediaStream | null) => void;
}

type GameState = 'OFFLINE' | 'MACRO' | 'LOBBY' | 'PLAYING' | 'DEATH';

export const Dashboard: React.FC<DashboardProps> = ({ logs, addLog, customModules = [], toggleModule, liveStream, setLiveStream }) => {
  const [isActive, setIsActive] = useState(false);
  const [gameState, setGameState] = useState<GameState>('OFFLINE');
  const [currentAction, setCurrentAction] = useState<string>('IDLE');
  const [npuLoad, setNpuLoad] = useState<number[]>(new Array(20).fill(10));
  const [useMacro, setUseMacro] = useState(true); // Toggle for Pre-Game Macro
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const simulationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moduleIntervalsRef = useRef<{ [key: string]: ReturnType<typeof setInterval> }>({});

  const weaponTarget = typeof window !== 'undefined' ? localStorage.getItem('rivals_weapon_target') || 'Grenade Launcher' : 'Grenade Launcher';

  // Start/Stop Logic
  const toggleAFK = async () => {
    if (isActive) {
      // DEACTIVATE
      setIsActive(false);
      setGameState('OFFLINE');
      addLog('AFK Sequence Deactivated', 'warning');
      setCurrentAction('IDLE');
      
      if (liveStream) {
        liveStream.getTracks().forEach(track => track.stop());
        setLiveStream(null);
      }
      
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
    } else {
      // ACTIVATE
      try {
        setIsActive(true);
        
        // Step 1: Execute Macro if enabled
        if (useMacro) {
            setGameState('MACRO');
            setCurrentAction('EXECUTING MACRO...');
            addLog('Initiating Pre-Game Mouse Sequence...', 'info');
            
            // Simulate Macro Duration (3s)
            await new Promise(resolve => setTimeout(resolve, 3000));
            addLog('Macro Sequence Complete. Entering Vision Mode.', 'action');
        }

        // Step 2: Request Screen Access
        addLog('Requesting Optical Feed Access...', 'info');
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                frameRate: 15,
            },
            audio: false
        });
        
        setLiveStream(stream);
        addLog('Optical Feed Secured. Neural Engine Attached.', 'info');
        setGameState('LOBBY'); 
        
        // Handle stream stop (user clicks "Stop sharing" in browser UI)
        stream.getVideoTracks()[0].onended = () => {
             setIsActive(false);
             setGameState('OFFLINE');
             setLiveStream(null);
             addLog('Optical Feed Lost.', 'warning');
        };

      } catch (err) {
          setIsActive(false);
          setGameState('OFFLINE');
          addLog('Access Denied: Screen Capture cancelled by user.', 'warning');
      }
    }
  };

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && liveStream) {
        videoRef.current.srcObject = liveStream;
    }
  }, [liveStream]);

  // NPU Load Simulation
  useEffect(() => {
    const interval = setInterval(() => {
        setNpuLoad(prev => {
            const newLoad = isActive 
                ? Math.floor(Math.random() * 40) + 40 // High load when active (40-80%)
                : Math.floor(Math.random() * 10) + 5; // Low load idle (5-15%)
            return [...prev.slice(1), newLoad];
        });
    }, 500);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className={`col-span-1 md:col-span-1 p-6 rounded-xl border ${isActive ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10'} backdrop-blur-sm transition-all`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold gamer-font text-gray-100">AI CORE</h3>
            <Eye className={isActive ? "text-green-400 animate-pulse" : "text-red-400"} />
          </div>
          <div className="flex flex-col gap-1">
             <div className="text-3xl font-bold mb-1">
                {isActive ? <span className="text-green-400">ONLINE</span> : <span className="text-red-400">OFFLINE</span>}
             </div>
             <div className="text-xs font-mono text-cyan-400 tracking-wider">
                {isActive ? currentAction : 'AWAITING INPUT'}
             </div>
          </div>
        </div>

        {/* Game State / Live Feed */}
        <div className="col-span-1 md:col-span-2 p-1 rounded-xl border border-cyan-500/30 bg-black backdrop-blur-sm relative overflow-hidden h-48 md:h-auto flex flex-col">
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-[10px] font-bold text-gray-200 tracking-wider">
                {isActive ? 'LIVE FEED // REC' : 'NO SIGNAL'}
            </span>
          </div>

          <div className="relative flex-1 bg-slate-900/50 rounded-lg overflow-hidden flex items-center justify-center group">
            {liveStream ? (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover opacity-80"
                />
            ) : (
                 <div className="flex flex-col items-center gap-2 text-slate-600">
                    <Cast size={32} />
                    <span className="text-xs font-mono tracking-widest">SIGNAL LOST</span>
                 </div>
            )}
            
            {/* Scanline overlay */}
            {isActive && <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />}
            
            {/* HUD Overlay */}
            <div className="absolute inset-0 border-2 border-white/5 m-2 rounded pointer-events-none flex flex-col justify-between p-2">
                 <div className="flex justify-between">
                     <span className="text-[8px] text-cyan-500/50 font-mono">CAM-01</span>
                     <span className="text-[8px] text-cyan-500/50 font-mono">1080p</span>
                 </div>
                 <div className="flex justify-center">
                    {isActive && <Crosshair className="text-red-500/30 w-12 h-12" strokeWidth={1} />}
                 </div>
            </div>
          </div>
        </div>

        {/* Control Logic */}
        <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center p-6 bg-slate-900/30 rounded-xl border border-slate-700">
            <button
            onClick={toggleAFK}
            className={`w-full relative group py-6 rounded-lg font-bold text-lg tracking-widest transition-all duration-300 flex items-center justify-center
                ${isActive 
                ? 'bg-red-500/20 hover:bg-red-500/40 text-red-300 ring-1 ring-red-500' 
                : 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500'
                }`}
            >
                <span className="flex flex-col items-center gap-1">
                    {isActive ? <Square fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                    <span className="text-xs">{isActive ? 'STOP FEED' : 'START FEED'}</span>
                </span>
            </button>
        </div>
      </div>
      
      {/* Logs */}
      <div className="bg-black/40 rounded-lg border border-slate-700 p-4 font-mono text-sm h-32 overflow-y-auto">
        <div className="space-y-1">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
              <span className={`${
                log.type === 'action' ? 'text-cyan-400' : 
                log.type === 'warning' ? 'text-red-400' : 'text-gray-300'
              }`}>
                {log.type === 'action' && '> '}
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};