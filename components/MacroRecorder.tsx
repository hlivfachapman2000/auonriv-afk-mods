import React, { useState, useRef, useEffect } from 'react';
import { MacroAction } from '../types';
import { Circle, Play, Square, Trash2, MousePointer2, Save, RotateCcw, Check } from 'lucide-react';

export const MacroRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actions, setActions] = useState<MacroAction[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  
  // Ghost cursor state for playback
  const [ghostCursor, setGhostCursor] = useState<{x: number, y: number, visible: boolean}>({ x: 0, y: 0, visible: false });

  const containerRef = useRef<HTMLDivElement>(null);
  const playbackTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleStartRecording = () => {
    setActions([]);
    setIsRecording(true);
    setStartTime(Date.now());
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isRecording || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Throttle: Only record every ~20ms or significant moves to save memory
    const now = Date.now();
    const delay = now - startTime;
    
    // Add logic here to reduce resolution if needed, but for demo raw is fine
    const newAction: MacroAction = {
      id: Math.random().toString(),
      type: 'MOVE',
      x,
      y,
      delay
    };

    setActions(prev => [...prev, newAction]);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isRecording || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newAction: MacroAction = {
      id: Math.random().toString(),
      type: 'CLICK',
      x,
      y,
      delay: Date.now() - startTime
    };
    
    setActions(prev => [...prev, newAction]);
  };

  const handlePlay = () => {
    if (actions.length === 0) return;
    
    setIsPlaying(true);
    setGhostCursor({ x: actions[0].x, y: actions[0].y, visible: true });

    // Clear previous
    playbackTimeouts.current.forEach(clearTimeout);
    playbackTimeouts.current = [];

    // Schedule playback
    actions.forEach((action, index) => {
        const t = setTimeout(() => {
            setGhostCursor({ x: action.x, y: action.y, visible: true });
            
            // Visual pulse on click
            if (action.type === 'CLICK') {
                // Could add specific visual effect here
            }

            // End playback check
            if (index === actions.length - 1) {
                setTimeout(() => {
                    setIsPlaying(false);
                    setGhostCursor(prev => ({ ...prev, visible: false }));
                }, 500);
            }
        }, action.delay);
        playbackTimeouts.current.push(t);
    });
  };

  const handleClear = () => {
    setActions([]);
    setIsPlaying(false);
    setIsRecording(false);
    playbackTimeouts.current.forEach(clearTimeout);
    setGhostCursor({ ...ghostCursor, visible: false });
  };

  const handleSave = () => {
      if (actions.length === 0) return;
      localStorage.setItem('rivals_macro_sequence', JSON.stringify(actions));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
  };

  // Generate SVG path from actions for visualization
  const getPathString = () => {
      if (actions.length < 2) return "";
      const moveActions = actions.filter(a => a.type === 'MOVE');
      if (moveActions.length === 0) return "";
      
      return moveActions.reduce((acc, action, i) => {
          return acc + `${i === 0 ? 'M' : 'L'} ${action.x} ${action.y} `;
      }, "");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      
      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-4 flex flex-col">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
            <h3 className="text-xl font-bold gamer-font text-gray-100 mb-4 flex items-center gap-2">
                <MousePointer2 className="text-cyan-400" /> SEQUENCE CONTROLS
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
                {!isRecording ? (
                    <button 
                        onClick={handleStartRecording}
                        disabled={isPlaying}
                        className="col-span-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white p-4 rounded-lg font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    >
                        <Circle fill="currentColor" size={16} /> REC MACRO
                    </button>
                ) : (
                    <button 
                        onClick={handleStopRecording}
                        className="col-span-2 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg font-bold tracking-widest transition-all border border-slate-600"
                    >
                        <Square fill="currentColor" size={16} /> STOP REC
                    </button>
                )}

                <button 
                    onClick={handlePlay}
                    disabled={isRecording || actions.length === 0 || isPlaying}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Play fill="currentColor" size={16} /> TEST SEQUENCE
                </button>

                <button 
                    onClick={handleClear}
                    disabled={isRecording || isPlaying}
                    className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-gray-300 p-3 rounded-lg font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RotateCcw size={16} /> RESET
                </button>
            </div>

            <div className="space-y-2 text-sm font-mono border-t border-slate-700 pt-4">
                <div className="flex justify-between text-gray-400">
                    <span>STATUS:</span>
                    <span className={isRecording ? 'text-red-500 animate-pulse' : isPlaying ? 'text-green-500 animate-pulse' : 'text-cyan-500'}>
                        {isRecording ? 'RECORDING INPUTS...' : isPlaying ? 'PLAYBACK ACTIVE' : 'STANDBY'}
                    </span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>EVENTS CAPTURED:</span>
                    <span className="text-white">{actions.length}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                    <span>DURATION:</span>
                    <span className="text-white">
                        {actions.length > 0 ? (actions[actions.length-1].delay / 1000).toFixed(2) : '0.00'}s
                    </span>
                </div>
            </div>
        </div>

        {/* Saved Macros (Static Demo) */}
        <div className="flex-1 bg-slate-800/30 p-6 rounded-xl border border-slate-700 backdrop-blur-sm overflow-hidden flex flex-col">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Saved Presets</h4>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-between group hover:border-cyan-500/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-cyan-900/30 flex items-center justify-center text-cyan-400">
                            <MousePointer2 size={16} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-200 text-sm">Lobby -> Play</div>
                            <div className="text-[10px] text-gray-500">24 Actions | 3.2s</div>
                        </div>
                    </div>
                    <Play size={14} className="text-gray-600 group-hover:text-cyan-400" />
                </div>
                <div className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-between group hover:border-cyan-500/30 transition-colors cursor-pointer">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-purple-900/30 flex items-center justify-center text-purple-400">
                            <Trash2 size={16} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-200 text-sm">Inventory Clear</div>
                            <div className="text-[10px] text-gray-500">105 Actions | 12.5s</div>
                        </div>
                    </div>
                    <Play size={14} className="text-gray-600 group-hover:text-purple-400" />
                </div>
            </div>
            
            <button 
                onClick={handleSave}
                disabled={actions.length === 0}
                className={`mt-4 w-full py-3 border text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
                    isSaved 
                    ? 'bg-green-600/20 border-green-500 text-green-400' 
                    : 'bg-cyan-600/20 hover:bg-cyan-600/30 border-cyan-500/30 text-cyan-400'
                }`}
            >
                {isSaved ? <Check size={14} /> : <Save size={14} />}
                {isSaved ? 'LINKED TO DASHBOARD' : 'LINK MACRO TO START'}
            </button>
        </div>
      </div>

      {/* Capture Area */}
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden group cursor-crosshair shadow-inner shadow-black/50">
          <div 
            ref={containerRef}
            className="absolute inset-0 z-10"
            onMouseMove={handleMouseMove}
            onMouseDown={handleClick}
          >
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                   style={{
                       backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                       backgroundSize: '40px 40px'
                   }} 
              />
              
              {/* Center Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-cyan-500/30 rounded-full pointer-events-none" />

              {/* Recorded Path Visualization */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path 
                    d={getPathString()} 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="2" 
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Click Markers */}
                  {actions.filter(a => a.type === 'CLICK').map(action => (
                      <circle 
                        key={action.id} 
                        cx={action.x} 
                        cy={action.y} 
                        r="4" 
                        fill="#ef4444" 
                        fillOpacity="0.8"
                      />
                  ))}
              </svg>
              
              {/* Ghost Cursor (Playback) */}
              {ghostCursor.visible && (
                  <div 
                    className="absolute pointer-events-none transition-transform duration-75 z-50"
                    style={{ 
                        transform: `translate(${ghostCursor.x}px, ${ghostCursor.y}px)`,
                        left: 0,
                        top: 0 
                    }}
                  >
                      <MousePointer2 className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" size={24} fill="currentColor" />
                  </div>
              )}

              {/* Recording Indicator Overlay */}
              {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-900/80 border border-red-500/50 px-3 py-1 rounded text-red-100 text-xs font-bold pointer-events-none animate-pulse">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      REC
                  </div>
              )}
          </div>
          
          <div className="absolute bottom-4 left-4 pointer-events-none text-xs font-mono text-gray-500">
              PAD RESOLUTION: {containerRef.current?.clientWidth}x{containerRef.current?.clientHeight}
          </div>
      </div>
    </div>
  );
};