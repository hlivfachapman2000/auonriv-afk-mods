import React, { useState } from 'react';
import { LayoutDashboard, MessageSquareText, Eye, Settings as SettingsIcon, Shield, Menu, X, Sliders, MousePointer2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { GeminiChat } from './components/GeminiChat';
import { Analyzer } from './components/Analyzer';
import { MacroRecorder } from './components/MacroRecorder';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { AppView, LogEntry, AFKModule } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Dynamic Modules State (Created by AI)
  const [customModules, setCustomModules] = useState<AFKModule[]>([]);

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

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard logs={logs} addLog={addLog} customModules={customModules} toggleModule={toggleModule} />;
      case AppView.CHAT:
        return <GeminiChat onNewModule={addModule} />;
      case AppView.ANALYZER:
        return <Analyzer />;
      case AppView.MACROS:
        return <MacroRecorder />;
      case AppView.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard logs={logs} addLog={addLog} customModules={customModules} toggleModule={toggleModule} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        currentView === view
          ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
          : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-200'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'} />
      <span className="font-semibold tracking-wide">{label}</span>
      {currentView === view && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Shield className="text-cyan-400" />
            <h1 className="font-bold gamer-font text-xl tracking-wider text-gray-100">AUONRIV2 <span className="text-cyan-400">AFK MOD</span></h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`
          lg:w-72 flex-shrink-0 flex flex-col gap-8
          fixed lg:static inset-0 bg-[#0f172a]/95 lg:bg-transparent z-50 p-6 lg:p-0 transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="hidden lg:flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold gamer-font text-2xl tracking-wider text-gray-100 leading-none">AUONRIV2</h1>
              <span className="text-xs text-cyan-400 tracking-[0.2em] font-semibold">AFK MOD</span>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">Operations</div>
            <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Command Center" />
            <NavItem view={AppView.MACROS} icon={MousePointer2} label="Macro Sequencer" />
            <NavItem view={AppView.CHAT} icon={MessageSquareText} label="Tactician AI" />
            <NavItem view={AppView.ANALYZER} icon={Eye} label="Vision Intel" />
            <NavItem view={AppView.SETTINGS} icon={Sliders} label="Settings" />
          </nav>

          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono text-green-400">SERVER ONLINE</span>
            </div>
            <div className="text-xs text-gray-500">v2.4.0-auonriv2</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <header className="mb-8 hidden lg:flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 gamer-font">
                {currentView === AppView.DASHBOARD && "COMMAND CENTER"}
                {currentView === AppView.MACROS && "MACRO SEQUENCER"}
                {currentView === AppView.CHAT && "TACTICAL COMMUNICATION"}
                {currentView === AppView.ANALYZER && "VISUAL INTELLIGENCE"}
                {currentView === AppView.SETTINGS && "SYSTEM CONFIGURATION"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {currentView === AppView.DASHBOARD && "Monitor automated protocols and system status."}
                {currentView === AppView.MACROS && "Record and automate menu navigation patterns."}
                {currentView === AppView.CHAT && "Consult Gemini Flash to generate new scripts."}
                {currentView === AppView.ANALYZER && "Upload gameplay for tactical breakdown."}
                {currentView === AppView.SETTINGS && "Customize application protocols and preferences."}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden xl:block">
                <div className="text-xs text-gray-500 font-mono tracking-widest">OPERATOR</div>
                <div className="text-sm font-bold text-cyan-400 tracking-wide">AUONRIV2</div>
              </div>
              <button 
                onClick={() => setCurrentView(AppView.SETTINGS)}
                className={`p-2 transition-colors ${currentView === AppView.SETTINGS ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'}`}
              >
                <SettingsIcon size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shadow-lg shadow-cyan-900/20">
                <span className="font-bold text-cyan-400">AU</span>
              </div>
            </div>
          </header>

          <div className="animate-fade-in-up">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;