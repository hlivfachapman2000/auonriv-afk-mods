import React, { useState, useEffect } from 'react';
import { LayoutDashboard, MessageSquareText, Shield, Menu, X, Sliders, MousePointer2, Save, RotateCcw, ChevronDown, CheckCircle, Lock } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { GeminiChat } from './components/GeminiChat';
import { MacroRecorder } from './components/MacroRecorder';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { LogEntry, AFKModule } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPreset, setCurrentPreset] = useState('BASIC SEQUENCE');
  const [isSaving, setIsSaving] = useState(false);
  
  // Shared Media Stream State (Video Feed)
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);

  // Dynamic Modules State
  const [customModules, setCustomModules] = useState<AFKModule[]>([]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
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
      addLog('Sequence Saved to Core.', 'info');
      setTimeout(() => setIsSaving(false), 2000);
  };

  const handleSystemReset = () => {
      if (confirm("Reset all sequences?")) {
          setCustomModules([]);
          setLogs([]);
          addLog('System Reset Complete.', 'warning');
      }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <button
      onClick={() => scrollToSection(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        activeSection === id
          ? 'bg-cyan-900/30 border border-cyan-500/50 text-cyan-400'
          : 'text-gray-400 hover:bg-slate-800 hover:text-gray-200'
      }`}
    >
      <Icon size={20} className={activeSection === id ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'} />
      <span className="font-semibold tracking-wide">{label}</span>
      {activeSection === id && <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
    </button>
  );

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-200 selection:bg-cyan-500/30 font-inter">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
        
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

        {/* Sidebar */}
        <aside className={`
          lg:w-64 flex-shrink-0 flex flex-col gap-6
          fixed lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] inset-0 bg-[#0f172a]/95 lg:bg-transparent z-40 p-6 lg:p-0 transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="hidden lg:flex items-center gap-3 px-2 mb-2">
            <div className="w-10 h-10 bg-cyan-900/30 border border-cyan-500/30 rounded-lg flex items-center justify-center">
              <Shield className="text-cyan-400" size={24} />
            </div>
            <div>
              <h1 className="font-bold gamer-font text-2xl tracking-wider text-gray-100 leading-none">AUONRIV2</h1>
              <span className="text-xs text-cyan-500 tracking-[0.2em] font-bold">PRO MODE</span>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4 mt-2">Core Systems</div>
            <NavItem id="dashboard" icon={LayoutDashboard} label="Status Feed" />
            <NavItem id="chat" icon={MessageSquareText} label="Tactical AI" />
            <NavItem id="macros" icon={MousePointer2} label="Macro Editor" />
            <NavItem id="settings" icon={Sliders} label="Settings" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col gap-8 pb-24">
          
          {/* Top Bar */}
          <header className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                 <div className="relative group">
                     <button className="flex items-center justify-between gap-3 bg-slate-800 border border-slate-600 text-gray-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider min-w-[180px]">
                         {currentPreset}
                         <ChevronDown size={14} />
                     </button>
                 </div>
             </div>

             <div className="flex items-center gap-2">
                 <button 
                    onClick={handleGlobalSave}
                    disabled={isSaving}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                        isSaving 
                        ? 'bg-green-600 text-white border-green-500' 
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400'
                    }`}
                 >
                     {isSaving ? <CheckCircle size={16} /> : <Save size={16} />}
                     {isSaving ? 'SAVED' : 'SAVE'}
                 </button>
             </div>
          </header>

          {/* DASHBOARD (Video Feed) */}
          <section id="dashboard" className="scroll-mt-28 space-y-4">
            <Dashboard 
                logs={logs} 
                addLog={addLog} 
                customModules={customModules} 
                toggleModule={toggleModule}
                liveStream={liveStream}
                setLiveStream={setLiveStream}
            />
          </section>
          
          {/* WORKSPACE: Chat + Macro */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* CHAT */}
              <section id="chat" className="scroll-mt-28 space-y-4 h-[700px]">
                 <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                    <MessageSquareText className="text-purple-400" size={24} />
                    <h2 className="text-2xl font-bold text-gray-100 gamer-font tracking-wide">AI TACTICIAN</h2>
                </div>
                <GeminiChat stream={liveStream} />
              </section>

              {/* MACROS */}
              <section id="macros" className="scroll-mt-28 space-y-4 h-[700px]">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                    <MousePointer2 className="text-cyan-400" size={24} />
                    <h2 className="text-2xl font-bold text-gray-100 gamer-font tracking-wide">SEQUENCE EDITOR</h2>
                </div>
                <MacroRecorder />
              </section>
          </div>
          
          {/* SETTINGS */}
          <section id="settings" className="scroll-mt-28 space-y-4">
            <Settings />
          </section>

        </main>
      </div>
    </div>
  );
};

export default App;