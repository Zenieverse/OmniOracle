import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, PlusCircle, User, X, Zap, 
  ShieldCheck, Bell, Wallet, LogOut, Menu
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, notifications, connectWallet, markNotificationRead } = useStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Markets', path: '/', icon: <Home size={20} /> },
    { label: 'Create Market', path: '/create', icon: <PlusCircle size={20} /> },
    { label: 'Profile', path: '/profile', icon: <User size={20} /> },
    { label: 'Admin', path: '/admin', icon: <ShieldCheck size={20} /> },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-500/30">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap className="fill-current" />
            <span className="text-xl font-bold tracking-tight text-white">OmniOracle</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-slate-900/50">
          {!user.isConnected ? (
             <button 
                onClick={connectWallet}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
             >
                <Wallet size={16} /> Connect Wallet
             </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance</span>
                <span className="text-emerald-400 font-mono font-bold">${user.balance.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-800 p-2 rounded border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                {user.walletAddress}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between p-4 md:px-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400">
                <Menu size={24} />
            </button>
            <h2 className="text-sm font-medium text-slate-500 hidden md:block">
                Decentralized Prediction Protocol v1.0
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Notifications */}
             <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-950"></span>
                    )}
                </button>
                
                {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-slate-800 font-bold text-sm bg-slate-950">Notifications</div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
                            ) : (
                                notifications.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => markNotificationRead(n.id)}
                                        className={`p-3 border-b border-slate-800 text-sm hover:bg-slate-800 cursor-pointer ${!n.read ? 'bg-slate-800/50' : ''}`}
                                    >
                                        <div className={`font-semibold mb-1 ${n.type === 'SUCCESS' ? 'text-emerald-400' : n.type === 'ERROR' ? 'text-rose-400' : 'text-blue-400'}`}>
                                            {n.title}
                                        </div>
                                        <div className="text-slate-400 text-xs">{n.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
             </div>
             
             {user.isConnected && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs shadow-lg shadow-cyan-500/20">
                    {user.username.charAt(0)}
                </div>
             )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
           {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;