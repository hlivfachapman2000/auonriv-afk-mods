import React, { useState } from 'react';
import { Save, Bell, Clock, Shield, Sliders, Volume2, Check, Crosshair } from 'lucide-react';

export const Settings: React.FC = () => {
  const [interval, setInterval] = useState(60000);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(false);
  const [stealthMode, setStealthMode] = useState(true);
  const [weaponTarget, setWeaponTarget] = useState('Grenade Launcher');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // In a real app, this would persist to localStorage or a backend
    localStorage.setItem('rivals_weapon_target', weaponTarget);
    localStorage.setItem('rivals_jump_interval', interval.toString());
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Automation Settings */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
            <Clock className="text-cyan-400" />
            <h3 className="text-xl font-bold gamer-font text-gray-100">AFK TIMING</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-gray-400">Jump Interval (Base)</label>
                <span className="text-cyan-400 font-mono">{interval / 1000}s</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="120000" 
                step="5000" 
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <p className="text-xs text-gray-500 mt-2">Base time between jumps. Random variance is applied automatically.</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-800">
              <span className="text-gray-300 text-sm">Randomize Variance (+/- 5s)</span>
              <div className="w-12 h-6 bg-cyan-900/50 rounded-full border border-cyan-500/30 relative flex items-center px-1">
                 <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/50 absolute right-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Targeting */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
            <Crosshair className="text-red-400" />
            <h3 className="text-xl font-bold gamer-font text-gray-100">TACTICAL AUTO-SELECT</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Primary Weapon / Hero Target</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={weaponTarget}
                  onChange={(e) => setWeaponTarget(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-gray-200 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono tracking-wide"
                />
                <Crosshair size={16} className="absolute right-4 top-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                The AI will visually scan for this text/icon on the selection screen (Lobby/Death) and move the mouse to click it.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-800">
               <div className="flex items-center gap-3">
                <Shield size={18} className="text-gray-400" />
                <span className="text-gray-300 text-sm">Death Detection (Auto-Re-Select)</span>
              </div>
              <button className="w-10 h-5 bg-cyan-600 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] ${
            isSaved ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          {isSaved ? <Check size={20} /> : <Save size={20} />}
          {isSaved ? 'CONFIGURATION SAVED' : 'SAVE CONFIGURATION'}
        </button>
      </div>
    </div>
  );
};