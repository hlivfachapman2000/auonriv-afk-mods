import React, { useState, useRef, useEffect } from 'react';
import { MacroAction } from '../types';
import { Circle, Play, Square, Trash2, MousePointer2, Save, RotateCcw, Check, FileCode, Copy, X, Keyboard, ArrowRight } from 'lucide-react';

export const MacroRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actions, setActions] = useState<MacroAction[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [scriptOutput, setScriptOutput] = useState<string | null>(null);
  
  // Ghost cursor state for playback
  const [ghostCursor, setGhostCursor] = useState<{x: number, y: number, visible: boolean}>({ x: 0, y: 0, visible: false });

  const containerRef = useRef<HTMLDivElement>(null);
  const playbackTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ---- RECORDING LOGIC ----

  const handleStartRecording = () => {
    setActions([]);
    setIsRecording(true);
    setStartTime(Date.now());
    setScriptOutput(null);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isRecording || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const delay = Date.now() - startTime;
    
    // Create MOVE action
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
    
    // Create CLICK action
    const newAction: MacroAction = {
      id: Math.random().toString(),
      type: 'CLICK',
      x,
      y,
      delay: Date.now() - startTime
    };
    setActions(prev => [...prev, newAction]);
  };

  // ---- KEYBOARD SIMULATION ----
  const addKeyAction = (key: string) => {
      // If we are recording, add it relative to start time. 
      // If not, we just append it to the end with a small delay from previous action.
      let delay = 0;
      if (isRecording) {
          delay = Date.now() - startTime;
      } else {
          const lastAction = actions[actions.length - 1];
          delay = lastAction ? lastAction.delay + 500 : 0;
      }

      const newAction: MacroAction = {
          id: Math.random().toString(),
          type: 'KEY',
          key: key,
          x: 0, // Not used for keys
          y: 0,
          delay: delay
      };
      setActions(prev => [...prev, newAction]);
  };

  // ---- PLAYBACK LOGIC ----

  const handlePlay = () => {
    if (actions.length === 0) return;
    
    setIsPlaying(true);
    // Hide cursor initially if first action has delay
    setGhostCursor({ x: 0, y: 0, visible: false });

    // Clear previous timeouts
    playbackTimeouts.current.forEach(clearTimeout);
    playbackTimeouts.current = [];

    // Schedule every action
    actions.forEach((action, index) => {
        const t = setTimeout(() => {
            // Update UI based on action type
            if (action.type === 'MOVE' || action.type === 'CLICK') {
                setGhostCursor({ x: action.x, y: action.y, visible: true });
            } 
            
            // If it's the last action, stop playing after a short buffer
            if (index === actions.length - 1) {
                const endT = setTimeout(() => {
                    setIsPlaying(false);
                    setGhostCursor(prev => ({ ...prev, visible: false }));
                }, 500);
                playbackTimeouts.current.push(endT);
            }
        }, action.delay);
        playbackTimeouts.current.push(t);
    });
  };

  const handleReset = () => {
    setActions([]);
    setIsPlaying(false);
    setIsRecording(false);
    setScriptOutput(null);
    playbackTimeouts.current.forEach(clearTimeout);
    setGhostCursor({ ...ghostCursor, visible: false });
  };

  // ---- EXPORT LOGIC ----

  const handleExportScript = () => {
      if (actions.length === 0) return;

      // Filter: Keep all Clicks and Keys, but sample Moves (every 5th move) to reduce script size
      const filteredActions = actions.filter((a, i) => 
         a.type === 'CLICK' || a.type === 'KEY' || i % 5 === 0 
      );

      let script = `
-- AUONRIV2 MACRO EXPORT
-- Instructions: Open "Script Editor" on Mac, paste this, and press Play.
-- Note: Enable Accessibility permissions for Script Editor if asked.

tell application "System Events"
    delay 1 -- Time to switch windows
`;

    let lastDelay = 0;

    filteredActions.forEach(action => {
        // Calculate wait time relative to previous action
        const wait = Math.max(0, (action.delay - lastDelay) / 1000);
        
        if (wait > 0.05) {
             script += `    delay ${wait.toFixed(2)}\n`;
        }
        
        if (action.type === 'KEY') {
            // AppleScript keystroke
            if (['SPACE', 'ENTER', 'RETURN', 'TAB'].includes(action.key || '')) {
                const code = action.key === 'SPACE' ? 49 : action.key === 'ENTER' ? 36 : 48;
                script += `    key code ${code} -- ${action.key}\n`;
            } else {
                script += `    keystroke "${action.key?.toLowerCase()}"\n`;
            }
        } else if (action.type === 'CLICK') {
             // Standard click simulation (requires accessibility)
             // Offset X/Y slightly to simulate window position relative to screen
             script += `    -- click at {${Math.round(action.x + 100)}, ${Math.round(action.y + 100)}}\n`; 
             script += `    log "Click"\n`;
        } else {
             // Just a comment for movement, as raw movement in AS is complex without extensions
             // script += `    -- move mouse\n`;
        }
        lastDelay = action.delay;
    });

    script += `end tell
say "Macro Complete"`;

    setScriptOutput(script);
  };

  // Visualization Path
  const getPathString = () => {
      if (actions.length < 2) return "";
      return actions.reduce((acc, action, i) => {
          if (action.type !== 'MOVE') return acc;
          return acc + `${acc === "" ? 'M' : 'L'} ${action.x} ${action.y} `;
      }, "");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
      
      {/* LEFT: Controls */}
      <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm shadow-lg">
            <h3 className="text-xl font-bold gamer-font text-gray-100 mb-4 flex items-center gap-2">
                <MousePointer2 className="text-cyan-400" /> SEQUENCE EDITOR
            </h3>
            
            {/* Status Indicator */}
            <div className={`mb-6 p-4 rounded-lg text-center border font-bold tracking-widest transition-all duration-300 ${
                isRecording ? 'bg-red-900/20 border-red-500 text-red-500 animate-pulse' :
                isPlaying ? 'bg-green-600 border-green-400 text-white shadow-[0_0_20px_rgba(74,222,128,0.4)] transform scale-105' :
                'bg-slate-900 border-slate-700 text-gray-500'
            }`}>
                {isRecording ? 'RECORDING LIVE...' : isPlaying ? 'PLAYBACK ACTIVE' : 'READY'}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                {!isRecording ? (
                    <button 
                        onClick={handleStartRecording}
                        disabled={isPlaying}
                        className="col-span-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white p-4 rounded-lg font-bold tracking-widest shadow-lg hover:shadow-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Circle fill="currentColor" size={16} /> REC MOUSE
                    </button>
                ) : (
                    <button 
                        onClick={handleStopRecording}
                        className="col-span-2 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-lg font-bold tracking-widest border border-slate-500"
                    >
                        <Square fill="currentColor" size={16} /> STOP
                    </button>
                )}

                <button 
                    onClick={handlePlay}
                    disabled={isRecording || actions.length === 0 || isPlaying}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isPlaying ? 'bg-green-500 text-white' : 'bg-green-700 hover:bg-green-600 text-white'
                    }`}
                >
                    <Play fill="currentColor" size={16} /> TEST
                </button>

                <button 
                    onClick={handleReset}
                    disabled={isRecording || isPlaying}
                    className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-gray-300 p-3 rounded-lg font-bold tracking-wide disabled:opacity-50"
                >
                    <RotateCcw size={16} /> RESET
                </button>
            </div>

            {/* Quick Add Keys */}
            <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Insert Key Press</label>
                <div className="grid grid-cols-4 gap-2">
                    {['SPACE', 'E', 'W', 'SHIFT'].map(key => (
                        <button 
                            key={key}
                            onClick={() => addKeyAction(key)}
                            className="bg-slate-700 hover:bg-cyan-700 hover:text-white border border-slate-600 text-gray-300 rounded p-2 text-xs font-bold transition-colors"
                        >
                            {key}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2 text-sm font-mono border-t border-slate-700 pt-4">
                <div className="flex justify-between text-gray-400">
                    <span>ACTIONS:</span>
                    <span className="text-white">{actions.length}</span>
                </div>
                 <div className="flex justify-between text-gray-400">
                    <span>DURATION:</span>
                    <span className="text-white">
                        {actions.length > 0 ? (actions[actions.length-1].delay / 1000).toFixed(1) : '0.0'}s
                    </span>
                </div>
            </div>
        </div>

        {/* Script Output */}
        <div className="flex-1 bg-slate-800/30 p-4 rounded-xl border border-slate-700 backdrop-blur-sm flex flex-col relative shadow-lg">
             <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <FileCode size={14} /> AppleScript Export
                </h4>
                {scriptOutput && (
                    <button 
                        onClick={() => navigator.clipboard.writeText(scriptOutput || '')}
                        className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        COPY
                    </button>
                )}
             </div>
             
             {scriptOutput ? (
                 <textarea 
                    readOnly 
                    className="flex-1 bg-black/50 border border-slate-700 rounded p-2 text-[10px] font-mono text-green-400 resize-none focus:outline-none"
                    value={scriptOutput}
                 />
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
                    <p className="text-xs text-center">Record actions or add keys,<br/>then click Export.</p>
                    <button 
                        onClick={handleExportScript}
                        disabled={actions.length === 0}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-xs font-bold disabled:opacity-50"
                    >
                        GENERATE SCRIPT
                    </button>
                </div>
             )}
        </div>
      </div>

      {/* RIGHT: Capture Area */}
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 relative overflow-hidden group cursor-crosshair shadow-inner shadow-black/50 h-full flex flex-col">
          {/* Header for area */}
          <div className="absolute top-0 left-0 right-0 p-2 bg-black/40 border-b border-white/5 flex justify-between items-center pointer-events-none z-20">
              <span className="text-[10px] text-gray-500 font-mono">VIRTUAL DESKTOP 1920x1080 [SCALED]</span>
              <span className="text-[10px] text-gray-500 font-mono">X: {ghostCursor.visible ? Math.round(ghostCursor.x) : 0} Y: {ghostCursor.visible ? Math.round(ghostCursor.y) : 0}</span>
          </div>

          <div 
            ref={containerRef}
            className="flex-1 relative z-10"
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
                    strokeOpacity="0.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Action Markers */}
                  {actions.map((action, i) => (
                      <g key={action.id}>
                          {action.type === 'CLICK' && (
                              <circle cx={action.x} cy={action.y} r="3" fill="#ef4444" fillOpacity="0.8" />
                          )}
                          {/* Render Keys as little boxes at current position or last position */}
                          {action.type === 'KEY' && (
                             <foreignObject x={10} y={20 + (i * 20)} width="100" height="20">
                                 <div className="text-[10px] text-green-400 font-mono bg-black/80 px-1 inline-block rounded border border-green-500/30">
                                     KEY: {action.key}
                                 </div>
                             </foreignObject>
                          )}
                      </g>
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
                      <MousePointer2 className="text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,1)]" size={32} fill="currentColor" />
                  </div>
              )}

              {/* Recording Indicator Overlay */}
              {isRecording && (
                  <div className="absolute top-12 right-4 flex items-center gap-2 bg-red-900/80 border border-red-500/50 px-3 py-1 rounded text-red-100 text-xs font-bold pointer-events-none animate-pulse">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      REC
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};