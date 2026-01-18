import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, AFKModule } from '../types';
import { Activity, Play, Square, Cpu, Wifi, ShieldAlert, Crosshair, RefreshCw, Eye, Zap, Cast, Terminal, Power, MousePointer2 } from 'lucide-react';

interface DashboardProps {
  logs: LogEntry[];
  addLog: (msg: string, type: 'info' | 'action' | 'warning') => void;
  customModules?: AFKModule[];
  toggleModule?: (id: string) => void;
}

type GameState = 'OFFLINE' | 'MACRO' | 'LOBBY' | 'PLAYING' | 'DEATH';

export const Dashboard: React.FC<DashboardProps> = ({ logs, addLog, customModules = [], toggleModule }) => {
  const [isActive, setIsActive] = useState(false);
  const [gameState, setGameState] = useState<GameState>('OFFLINE');
  const [currentAction, setCurrentAction] = useState<string>('IDLE');
  const [npuLoad, setNpuLoad] = useState<number[]>(new Array(20).fill(10));
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
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
                frameRate: 15, // Low framerate for style/perf
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

  // Main Logic Loop
  useEffect(() => {
    if (!isActive) return;

    const runLogic = () => {
      // CLEAR PREVIOUS TIMERS
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);

      if (gameState === 'MACRO') {
          // Just waiting for the toggleAFK logic to switch us to LOBBY
          return; 
      }

      if (gameState === 'LOBBY' || gameState === 'DEATH') {
        setCurrentAction('SCANNING FEED...');
        // Only log sporadically to avoid spam
        if (Math.random() > 0.7) addLog(`AI Vision: Scanning pixels for "${weaponTarget}"...`, 'info');

        simulationTimerRef.current = setTimeout(() => {
          setCurrentAction('TARGET LOCKED');
          addLog(`AI Vision: Match Confirmed (Confidence 98%)`, 'action');
          
          simulationTimerRef.current = setTimeout(() => {
             setCurrentAction('INTERACTING...');
             
             simulationTimerRef.current = setTimeout(() => {
               setGameState('PLAYING');
               addLog('State: In-Game. Engaging Jump Protocol.', 'info');
               setCurrentAction('MONITORING...');
             }, 1000);
          }, 800);
        }, 3000);
      } 
      else if (gameState === 'PLAYING') {
        // In playing state, we just wait for "Death" simulation
        const randomDeathTime = Math.random() * 40000 + 40000; 
        simulationTimerRef.current = setTimeout(() => {
          addLog('AI Vision: Detected "ELIMINATED" text. Resetting.', 'warning');
          setGameState('DEATH');
        }, randomDeathTime);
      }
    };

    runLogic();

    return () => {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    };
  }, [isActive, gameState, addLog, weaponTarget]);

  // Parallel Jump Loop (Only active when PLAYING)
  useEffect(() => {
    if (!isActive || gameState !== 'PLAYING') {
      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
      return;
    }

    const performJump = () => {
      const variance = Math.floor(Math.random() * 5000); // 0-5s random delay
      addLog(`AFK Protocol: Jump [SPACE] (Delay: +${variance}ms)`, 'action');
      setCurrentAction('JUMPING');
      
      setTimeout(() => setCurrentAction('MONITORING...'), 500);

      const nextInterval = 60000 + (Math.random() * 10000 - 5000); 
      jumpTimerRef.current = setTimeout(performJump, nextInterval);
    };

    jumpTimerRef.current = setTimeout(performJump, 2000);

    return () => {
      if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current);
    };
  }, [isActive, gameState, addLog]);

  // --- Dynamic Modules Logic ---
  // When a custom module is active AND the main system is active/playing, run its loop
  useEffect(() => {
      // Cleanup all module intervals on change
      Object.values(moduleIntervalsRef.current).forEach(clearInterval);
      moduleIntervalsRef.current = {};

      if (!isActive || gameState !== 'PLAYING') return;

      customModules.forEach(mod => {
          if (mod.isActive) {
              const runModule = () => {
                  addLog(`Module "${mod.name}": ${mod.actionLogMessage} [${mod.key}]`, 'action');
              };
              // Set interval
              moduleIntervalsRef.current[mod.id] = setInterval(runModule, mod.interval);
          }
      });

      return () => {
          Object.values(moduleIntervalsRef.current).forEach(clearInterval);
      };

  }, [isActive, gameState, customModules, addLog]);


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
            {isActive && liveStream ? (
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
            
            {/* MACRO OVERLAY - When executing macro */}
            {gameState === 'MACRO' && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center">
                        <MousePointer2 className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
                        <h3 className="text-cyan-400 font-bold gamer-font text-2xl mt-4 animate-pulse">EXECUTING MACRO</h3>
                        <p className="text-gray-400 font-mono text-xs">REPLAYING INPUT SEQUENCE...</p>
                    </div>
                </div>
            )}

            {/* HUD Overlay */}
            <div className="absolute inset-0 border-2 border-white/5 m-2 rounded pointer-events-none flex flex-col justify-between p-2">
                 <div className="flex justify-between">
                     <span className="text-[8px] text-cyan-500/50 font-mono">CAM-01 [ACTIVE]</span>
                     <span className="text-[8px] text-cyan-500/50 font-mono">1080p / 60FPS</span>
                 </div>
                 <div className="flex justify-center">
                    {isActive && gameState !== 'MACRO' && <Crosshair className="text-red-500/30 w-12 h-12" strokeWidth={1} />}
                 </div>
                 <div className="flex justify-between">
                     <span className="text-[8px] text-cyan-500/50 font-mono">X: 840 Y: 920</span>
                     <span className="text-[8px] text-cyan-500/50 font-mono">ISO 800</span>
                 </div>
            </div>
          </div>
        </div>

        {/* Neural Telemetry */}
        <div className="col-span-1 md:col-span-1 p-4 rounded-xl border border-blue-500/30 bg-slate-800/50 backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-blue-400" />
                    <span className="text-xs font-bold text-blue-300">NPU LOAD</span>
                </div>
                <span className="text-xs font-mono text-gray-400">M4-NEURAL</span>
            </div>
            <div className="flex items-end gap-1 h-12 mb-2">
                {npuLoad.map((val, i) => (
                    <div 
                        key={i} 
                        className="flex-1 bg-blue-500/40 rounded-sm transition-all duration-300"
                        style={{ height: `${val}%`, opacity: (i / npuLoad.length) + 0.2 }}
                    />
                ))}
            </div>
            <div className="text-xs text-right text-gray-500 font-mono">
                {npuLoad[npuLoad.length-1]}% UTILIZATION
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Dynamic Modules Grid - Rendered if modules exist */}
        {customModules.length > 0 && (
            <div className="col-span-1 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {customModules.map(mod => (
                    <button
                        key={mod.id}
                        onClick={() => toggleModule && toggleModule(mod.id)}
                        className={`p-4 rounded-xl border flex flex-col gap-2 transition-all text-left group relative overflow-hidden ${
                            mod.isActive 
                            ? 'bg-purple-900/20 border-purple-500/50' 
                            : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/30'
                        }`}
                    >
                        {mod.isActive && <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>}
                        <div className="flex items-center justify-between relative z-10">
                            <Terminal size={16} className={mod.isActive ? 'text-purple-400' : 'text-gray-500'} />
                            <Power size={14} className={mod.isActive ? 'text-green-400' : 'text-gray-600'} />
                        </div>
                        <div className="relative z-10">
                            <div className="font-bold text-gray-200 text-sm truncate">{mod.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-1">
                                KEY: <span className="text-cyan-400">{mod.key}</span> | {mod.interval}ms
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* Target Info */}
        <div className="col-span-1 md:col-span-2 p-6 rounded-xl border border-purple-500/30 bg-slate-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold gamer-font text-purple-300">AUTO-SELECT</h3>
            <Crosshair className="text-purple-400" />
          </div>
          <div className="flex flex-col justify-end h-full">
            <div className="text-xs text-gray-400 uppercase">Current Target</div>
            <div className="text-xl text-white font-bold truncate">{weaponTarget}</div>
            <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <RefreshCw size={10} />
                <span>RE-ACQUIRE ON DEATH: ON</span>
            </div>
          </div>
        </div>

        {/* Main Control */}
        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-900/30 rounded-xl border border-slate-700">
            <button
            onClick={toggleAFK}
            className={`w-full relative group py-6 rounded-lg font-bold text-2xl tracking-widest transition-all duration-300 flex items-center justify-center
                ${isActive 
                ? 'bg-red-500/20 hover:bg-red-500/40 text-red-300 ring-1 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 ring-1 ring-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                }`}
            >
            <span className="flex items-center gap-3">
                {isActive ? <Square fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} />}
                {isActive ? 'TERMINATE MOD' : 'ACTIVATE MOD'}
            </span>
            </button>
            
            <div className="mt-4 flex items-center gap-4">
                 <button 
                    onClick={() => setUseMacro(!useMacro)}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        useMacro ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'bg-transparent border-slate-600 text-gray-500'
                    }`}
                 >
                     <MousePointer2 size={10} />
                     <span>Pre-Game Macro: {useMacro ? 'ON' : 'OFF'}</span>
                 </button>
                 
                 <p className="text-[10px] text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                    <ShieldAlert size={12} />
                    <span>Localhost:3000</span>
                 </p>
            </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-black/40 rounded-lg border border-slate-700 p-4 font-mono text-sm h-48 overflow-y-auto">
        <div className="sticky top-0 bg-black/80 pb-2 mb-2 border-b border-slate-800 text-gray-400 text-xs uppercase tracking-wider flex justify-between">
            <span>Runtime Logs</span>
            <span className="text-cyan-600">v2.4.2</span>
        </div>
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
          {logs.length === 0 && <span className="text-gray-600 italic">Initializing vision systems...</span>}
        </div>
      </div>
    </div>
  );
};