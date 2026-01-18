import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquareText, Eye, Settings as SettingsIcon, Shield, Menu, X, Sliders, MousePointer2, Save, RotateCcw, ChevronDown, CheckCircle } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { GeminiChat } from './components/GeminiChat';
import { Analyzer } from './components/Analyzer';
import { MacroRecorder } from './components/MacroRecorder';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { AppView, LogEntry, AFKModule } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPreset, setCurrentPreset] = useState('AFK XP FARM');
  const [isSaving, setIsSaving] = useState(false);
  
  // Dynamic Modules State (Created by AI)
  const [customModules, setCustomModules] = useState<AFKModule[]>([]);

  // Intersection Observer to update active sidebar link based on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [isAuthenticated]);

  const addLog = (message: string, type: 'info' | 'action' | 'warning') => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 50));
  };

  const addModule = (module: Omit<AFKModule, 'id' | 'isActive'>) => {
    const newModule: AFKModule = {
        ...module,
        id: Date.now().toString(),
        isActive: false
    };
    setCustomModules(prev => [...prev, newModule]);
    addLog(`System Update: Module "${module.name}" installed successfully.`, 'info');
  };

  const toggleModule = (id: string) => {
      setCustomModules(prev => prev.map(m => 
          m.id === id ? { ...m, isActive: !m.isActive } : m
      ));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  const handleGlobalSave = () => {
      setIsSaving(true);
      addLog('System State Saved to Core Memory.', 'info');
      setTimeout(() => setIsSaving(false), 2000);
  };

  const handleSystemReset = () => {
      if (confirm("WARNING: Initiate Factory Reset? This will clear logs and custom modules.")) {
          setCustomModules([]);
          setLogs([]);
          addLog('System Factory Reset Complete.', 'warning');
      }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => scrollToSection(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        activeSection === id
          ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
          : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-200'
      }`}
    >
      <Icon size={20} className={activeSection === id ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'} />
      <span className="font-semibold tracking-wide">{label}</span>
      {activeSection === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
    </button>
  );

  // Show Login Screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Main App Interface
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-8">
        
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-4 z-50 flex items-center justify-between mb-4 bg-slate-900/90 p-4 rounded-xl border border-slate-700 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2">
            <Shield className="text-cyan-400" />
            <h1 className="font-bold gamer-font text-xl tracking-wider text-gray-100">AUONRIV2</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Sidebar (Fixed on Desktop) */}
        <aside className={`
          lg:w-64 flex-shrink-0 flex flex-col gap-6
          fixed lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] inset-0 bg-[#0f172a]/95 lg:bg-transparent z-40 p-6 lg:p-0 transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="hidden lg:flex items-center gap-3 px-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold gamer-font text-2xl tracking-wider text-gray-100 leading-none">AUONRIV2</h1>
              <span className="text-xs text-cyan-400 tracking-[0.2em] font-semibold">AFK MOD</span>
            </div>
          </div>

          <nav className="space-y-1 flex-1 overflow-y-auto pr-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4 mt-2">Sectors</div>
            <NavItem id="dashboard" icon={LayoutDashboard} label="Command Center" />
            <NavItem id="macros" icon={MousePointer2} label="Macro Sequencer" />
            <NavItem id="chat" icon={MessageSquareText} label="Tactical AI" />
            <NavItem id="analyzer" icon={Eye} label="Vision Intel" />
            <NavItem id="settings" icon={Sliders} label="System Config" />
          </nav>

          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono text-green-400">SERVER ONLINE</span>
            </div>
            <div className="text-xs text-gray-500">v2.4.5-STABLE</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col gap-12 pb-24">
          
          {/* Global Top Bar */}
          <header className="sticky top-4 z-30 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
             <div className="flex items-center gap-4 w-full sm:w-auto">
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:block">Active Profile:</div>
                 <div className="relative group flex-1 sm:flex-none">
                     <button className="flex items-center justify-between gap-3 bg-slate-800 border border-slate-600 hover:border-cyan-500 text-cyan-400 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider min-w-[180px] transition-colors">
                         {currentPreset}
                         <ChevronDown size={14} />
                     </button>
                     {/* Fake Dropdown */}
                     <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-600 rounded-lg mt-1 hidden group-hover:block shadow-xl overflow-hidden">
                         {['AFK XP FARM', 'COMPETITIVE ASSIST', 'TESTING ENV'].map(preset => (
                             <div 
                                key={preset} 
                                onClick={() => setCurrentPreset(preset)}
                                className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-xs text-gray-300 font-bold"
                             >
                                 {preset}
                             </div>
                         ))}
                     </div>
                 </div>
             </div>

             <div className="flex items-center gap-2 w-full sm:w-auto">
                 <button 
                    onClick={handleGlobalSave}
                    disabled={isSaving}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                        isSaving 
                        ? 'bg-green-600/20 border-green-500 text-green-400' 
                        : 'bg-cyan-600/10 hover:bg-cyan-600/20 border-cyan-500/50 text-cyan-400'
                    }`}
                 >
                     {isSaving ? <CheckCircle size={16} /> : <Save size={16} />}
                     {isSaving ? 'SAVED' : 'SAVE ALL'}
                 </button>
                 
                 <button 
                    onClick={handleSystemReset}
                    className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg transition-colors"
                    title="Factory Reset"
                 >
                     <RotateCcw size={16} />
                 </button>
             </div>
          </header>

          {/* SECTION: DASHBOARD */}
          <section id="dashboard" className="scroll-mt-28 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                <LayoutDashboard className="text-cyan-400" size={24} />
                <h2 className="text-2xl font-bold text-gray-100 gamer-font tracking-wide">COMMAND CENTER</h2>
            </div>
            <Dashboard logs={logs} addLog={addLog} customModules={customModules} toggleModule={toggleModule} />
          </section>
          
          {/* SECTION: MACROS */}
          <section id="macros" className="scroll-mt-28 space-y-4">
             <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                <MousePointer2 className="text-cyan-400" size={24} />
                <h2 className="text-2xl font-bold text-gray-100 gamer-font tracking-wide">MACRO SEQUENCER</h2>
            </div>
            <MacroRecorder />
          </section>
          
          {/* SECTOR SPLIT: CHAT & ANALYZER */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <section id="chat" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                    <MessageSquareText className="text-purple-400" size={24} />
                    <h2 className="text-2xl font-bold text-gray-100 gamer-font tracking-wide">TACTICAL AI</h2>
                </div>
                <GeminiChat onNewModule={addModule} />
              </section>
              
              <section id="analyzer" className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                    <Eye className="text-blue-400" size={24} />
                    <h2 className="text-2xl font-bold text-gray-100 gamer-font tracking-wide">VISION INTEL</h2>
                </div>
                <Analyzer />
              </section>
          </div>
          
          {/* SECTION: SETTINGS */}
          <section id="settings" className="scroll-mt-28 space-y-4">
             <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                <Sliders className="text-gray-400" size={24} />
                <h2 className="text-2xl font-bold text-gray-100 gamer-font tracking-wide">SYSTEM CONFIGURATION</h2>
            </div>
            <Settings />
          </section>

        </main>
      </div>
    </div>
  );
};

export default App;