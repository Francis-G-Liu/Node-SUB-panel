import React, { useState, useEffect, useMemo } from 'react';
import UserPortal from './UserPortal';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Server, 
  Network, 
  CreditCard, 
  Ticket as TicketIcon, 
  Bell, 
  Users, 
  History, 
  RefreshCw, 
  Plus, 
  Search, 
  ChevronRight, 
  Activity, 
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Send,
  Sun,
  Moon,
  Languages,
  FileUp,
  X,
  Menu,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { cn } from './lib/utils';
import {
  extractLegacyProviderYamlFields,
  extractNodeYamlFields,
} from './lib/safe-yaml';
import { useAuthStore, type UserRole } from './store/auth';
import type { 
  Node, Provider, Plan, Subscription, Ticket, Alert, User, AuditLog, Stats 
} from './types';

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div className={cn("bg-card text-card-foreground border border-slate-200/60 dark:border-slate-800/50 rounded-xl overflow-hidden shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300", className)} {...props}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, color, iconColor }: any) => {
  const { t } = useTranslation();
  return (
    <Card className="p-4 sm:p-6 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-black tracking-tight">{value}</h3>
          {trend && (
            <div className={cn("flex items-center mt-2 text-xs font-bold", trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {trend > 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
              {Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}
            </div>
          )}
        </div>
        <div className={cn("p-4 rounded-2xl transition-all duration-300 shadow-sm shadow-black/5", color)}>
          <Icon size={26} className={iconColor} />
        </div>
      </div>
    </Card>
  );
};

const Badge = ({ children, variant = 'default', hierarchy = 'secondary', ...props }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'info', hierarchy?: 'primary' | 'secondary', [key: string]: any }) => {
  const variants = {
    default: {
      primary: 'bg-tag-default-text text-white border-tag-default-text dark:bg-tag-default-text dark:text-tag-default-bg shadow-sm',
      secondary: 'bg-tag-default-bg text-tag-default-text border-tag-default-border'
    },
    success: {
      primary: 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 dark:border-emerald-500 shadow-sm',
      secondary: 'bg-tag-success-bg text-tag-success-text border-tag-success-border'
    },
    warning: {
      primary: 'bg-amber-500 text-amber-950 border-amber-500 dark:bg-amber-400 dark:text-amber-950 dark:border-amber-400 shadow-sm',
      secondary: 'bg-tag-warning-bg text-tag-warning-text border-tag-warning-border'
    },
    danger: {
      primary: 'bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:text-rose-950 dark:border-rose-500 shadow-sm',
      secondary: 'bg-tag-danger-bg text-tag-danger-text border-tag-danger-border'
    },
    info: {
      primary: 'bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:text-sky-950 dark:border-sky-500 shadow-sm',
      secondary: 'bg-tag-info-bg text-tag-info-text border-tag-info-border'
    },
  };
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border",
      "hover:brightness-95 active:scale-95 cursor-default flex items-center justify-center w-fit",
      variants[variant][hierarchy]
    )}>
      {children}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[85%] md:max-w-lg lg:max-w-2xl bg-card border border-border dark:border-slate-700/30 rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] z-[51] flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border dark:border-slate-700/30 flex items-center justify-between shrink-0 bg-card/50 backdrop-blur-sm">
              <h3 className="font-bold text-lg text-foreground">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all hover:rotate-90 duration-300">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar bg-card">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const BrandLogo = ({ size = 36, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className}>
    <defs>
      <linearGradient id="brandGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
    <rect width="36" height="36" rx="10" fill="url(#brandGrad)" />
    {/* Node network: 4 nodes + connecting lines */}
    <circle cx="12" cy="12" r="2.5" fill="white" />
    <circle cx="24" cy="12" r="2.5" fill="white" />
    <circle cx="12" cy="24" r="2.5" fill="white" />
    <circle cx="24" cy="24" r="2.5" fill="white" />
    <line x1="14.5" y1="12" x2="21.5" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="14.5" x2="12" y2="21.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="14.5" x2="24" y2="21.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14.5" y1="24" x2="21.5" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14" y1="14" x2="22" y2="22" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const LoginView = ({ email, setEmail, password, setPassword, isLoggingIn, handleLogin }: any) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Brand grid background */}
      <div className="absolute inset-0 login-grid-bg" />
      <div className="absolute inset-0 login-glow" />

      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 flex flex-col items-center relative z-10"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 logo-glow">
            <BrandLogo size={80} />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tighter text-foreground flex items-center gap-2.5">
            NodeAdmin
            <span className="brand-gradient text-sm font-black px-2.5 py-1 rounded-lg text-white">PRO</span>
          </h1>
          <p className="text-muted-foreground font-semibold text-center max-w-[280px] sm:max-w-none opacity-80">{t('loginSubtitle')}</p>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <Card className="p-8 sm:p-10 bg-card/80 backdrop-blur-xl border border-brand/20 dark:border-brand/10 shadow-2xl rounded-[32px]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-sm font-bold text-foreground/80 ml-1">{t('username')}</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand transition-colors">
                  <UserIcon size={20} />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@airport.dev"
                  className="w-full pl-12 pr-4 py-4 bg-muted/30 border-2 border-transparent rounded-2xl focus:bg-card focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all text-foreground placeholder:text-muted-foreground/50 font-medium outline-none"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-foreground/80">{t('password')}</label>
                <button type="button" className="text-sm font-bold text-brand hover:text-brand-dark transition-colors">
                  {t('forgotPassword')}
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-muted/30 border-2 border-transparent rounded-2xl focus:bg-card focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all text-foreground placeholder:text-muted-foreground/50 font-medium outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1 py-1">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-border checked:border-brand checked:bg-brand transition-all" 
                />
                <CheckCircle2 size={12} className="absolute left-1 top-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <label htmlFor="remember" className="text-sm font-bold text-muted-foreground cursor-pointer select-none">{t('rememberMe')}</label>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 brand-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:brightness-110 transform active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 dark:shadow-blue-500/15 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="animate-spin" size={20} />
                  {t('loggingIn')}
                </span>
              ) : (
                <>
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                  {t('loginNow')}
                </>
              )}
            </button>
          </form>
        </Card>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-muted-foreground/50 text-xs font-medium tracking-wider relative z-10"
      >
        NodeAdmin Pro v1.0.0
      </motion.p>
    </div>
  );
};

// --- Views ---

const DashboardView = ({ stats, nodeStream, alertStream, onRefresh }: any) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard')}</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{t('systemHealthy')}</p>
        </div>
        <button 
          onClick={onRefresh}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-muted shadow-sm transition-all duration-300"
        >
          <RefreshCw size={16} />
          {t('refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title={t('totalNodes')} 
          value={stats?.totalNodes || 0} 
          icon={Network} 
          color="bg-slate-100/80 dark:bg-slate-500/10" 
          iconColor="text-slate-600 dark:text-slate-400" 
          trend={12} 
        />
        <StatCard 
          title={t('onlineNodes')} 
          value={stats?.onlineNodes || 0} 
          icon={Activity} 
          color="bg-emerald-100/80 dark:bg-emerald-500/10" 
          iconColor="text-emerald-600 dark:text-emerald-500" 
          trend={5} 
        />
        <StatCard 
          title={t('activeSubs')} 
          value={stats?.activeSubs || 0} 
          icon={CreditCard} 
          color="bg-sky-100/80 dark:bg-sky-500/10" 
          iconColor="text-sky-600 dark:text-sky-500" 
          trend={-2} 
        />
        <StatCard 
          title={t('pendingTickets')} 
          value={stats?.pendingTickets || 0} 
          icon={TicketIcon} 
          color="bg-amber-100/80 dark:bg-amber-500/10" 
          iconColor="text-amber-600 dark:text-amber-500" 
          trend={8} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <Card className="flex flex-col h-[400px] lg:col-span-1 xl:col-span-2">
          <div className="p-4 border-b border-border dark:border-none flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Server size={18} />
              {t('nodeActivity')}
            </h3>
            <Badge variant="info">{t('live')}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {nodeStream.map((log: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/50 border border-border dark:border-none transition-colors duration-300">
                <span className="text-muted-foreground">[{log.time}]</span>
                <span className="font-bold">{log.node}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border transition-all duration-300",
                  log.action === 'Online' 
                    ? "bg-tag-success-bg text-tag-success-text border-tag-success-border" 
                    : "bg-tag-danger-bg text-tag-danger-text border-tag-danger-border"
                )}>
                  {log.action === 'Online' ? t('online') : t('offline')}
                </span>
              </div>
            ))}
            {nodeStream.length === 0 && <div className="text-muted-foreground italic">{t('waitingEvents')}</div>}
          </div>
        </Card>

        <Card className="flex flex-col h-[400px] lg:col-span-1 xl:col-span-1">
          <div className="p-4 border-b border-border dark:border-none flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldAlert size={18} />
              {t('systemAlerts')}
            </h3>
            <Badge variant="danger">{t('live')}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {alertStream.map((log: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-none transition-colors duration-300">
                <span className="text-muted-foreground">[{log.time}]</span>
                <span className="font-bold text-rose-700 dark:text-rose-400">{log.name}</span>
                <Badge variant={log.severity === 'Critical' ? 'danger' : 'warning'}>{log.severity}</Badge>
              </div>
            ))}
            {alertStream.length === 0 && <div className="text-muted-foreground italic">{t('noAlerts')}</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

const ProvidersView = ({ providers, onAction }: { providers: Provider[], onAction: any }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [yamlFile, setYamlFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    region: 'Global',
    interval: 60,
    tags: '',
    yamlContent: ''
  });

  const filteredProviders = useMemo(() => providers.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.url.toLowerCase().includes(search.toLowerCase()) ||
    p.region.toLowerCase().includes(search.toLowerCase())
  ), [providers, search]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setYamlFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        try {
          const parsed = extractLegacyProviderYamlFields(content);
          setFormData(prev => ({ 
            ...prev, 
            name: parsed.name ?? prev.name,
            url: parsed.url ?? prev.url,
            region: parsed.region ?? prev.region,
            interval: parsed.interval ?? prev.interval,
            tags: parsed.tags ?? prev.tags,
            yamlContent: content 
          }));
          toast.success(t('parsed'));
        } catch {
          setFormData(prev => ({ ...prev, yamlContent: content }));
          toast.success(t('loaded'));
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (editingProvider) {
      setFormData({
        name: editingProvider.name,
        url: editingProvider.url || '',
        region: editingProvider.region,
        interval: editingProvider.interval,
        tags: editingProvider.tags.join(', '),
        yamlContent: editingProvider.yamlContent || ''
      });
    } else {
      setFormData({ name: '', url: '', region: 'Global', interval: 60, tags: '', yamlContent: '' });
      setYamlFile(null);
    }
  }, [editingProvider]);

  const parseYamlContent = () => {
    if (!formData.yamlContent) return;
    try {
      const parsed = extractLegacyProviderYamlFields(formData.yamlContent);
      setFormData(prev => ({
        ...prev,
        name: parsed.name ?? prev.name,
        url: parsed.url ?? prev.url,
        region: parsed.region ?? prev.region,
        interval: parsed.interval ?? prev.interval,
        tags: parsed.tags ?? prev.tags
      }));
      toast.success(t('parsed'));
    } catch {
      toast.error(t('invalidYaml'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
    const payload = { 
      name: formData.name,
      subscriptionUrl: formData.url,
      regionHint: formData.region,
      syncIntervalMinutes: formData.interval,
      tags: tagsArray 
    };

    if (editingProvider) {
      onAction('providers', editingProvider.id, 'update', payload);
    } else {
      onAction('providers', null, 'create', payload);
    }
    
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProvider(null);
    setFormData({ name: '', url: '', region: 'Global', interval: 60, tags: '', yamlContent: '' });
    setYamlFile(null);
  };

  const confirmDelete = () => {
    if (providerToDelete) {
      onAction('providers', providerToDelete, 'delete');
      setIsDeleteModalOpen(false);
      setProviderToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('providers')}</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage your node provider API connections</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all w-full md:w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => {
              setEditingProvider(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-accent/10 transition-all duration-300 whitespace-nowrap"
          >
            <Plus size={16} />
            {t('addProvider')}
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingProvider ? t('editProvider') : t('addProvider')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('name')}</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. AWS Global"
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('url')}</label>
            <input 
              required
              type="url" 
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
              placeholder="https://api.provider.com"
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('region')}</label>
              <input 
                type="text" 
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value})}
                placeholder="Global"
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('syncInterval')} ({t('minutes')})</label>
              <input 
                required
                type="number" 
                min="1"
                value={formData.interval}
                onChange={e => setFormData({...formData, interval: parseInt(e.target.value)})}
                placeholder="60"
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('tags')} ({t('commaSeparated')})</label>
            <input 
              type="text" 
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              placeholder="e.g. high-speed, premium"
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('importYaml')}</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".yaml,.yml"
                onChange={handleFileChange}
                className="hidden"
                id="yaml-upload"
              />
              <label 
                htmlFor="yaml-upload"
                className="flex flex-col items-center justify-center gap-2 w-full py-6 bg-muted/40 border border-border rounded-xl cursor-pointer hover:bg-muted/60 transition-all group"
              >
                <FileUp size={24} className="text-muted-foreground group-hover:text-accent transition-colors" />
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {yamlFile ? yamlFile.name : t('selectFile')}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 uppercase tracking-wider">YAML / YML</p>
                </div>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">{t('yamlContent')}</label>
              <button 
                type="button"
                onClick={parseYamlContent}
                className="text-[10px] uppercase tracking-wider font-bold text-accent hover:underline"
              >
                {t('parse')}
              </button>
            </div>
            <textarea
              value={formData.yamlContent}
              onChange={e => setFormData({...formData, yamlContent: e.target.value})}
              placeholder="Paste YAML content here..."
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all h-32 font-mono text-xs"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={closeModal}
              className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-all"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirmDelete')}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('deleteProviderWarning')}
          </p>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={confirmDelete}
              className="flex-1 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 transition-colors duration-300">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('name')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('url')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('region')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('syncInterval')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('lastSync')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('tags')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProviders.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50 transition-colors duration-300">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono truncate max-w-[200px]" title={p.url}>{p.url}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.region}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.interval}m</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{p.lastSync}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {p.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onAction('providers', p.id, 'sync')}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-300" 
                        title={t('sync')}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingProvider(p);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-300" 
                        title={t('edit')}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          setProviderToDelete(p.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-rose-600 transition-colors duration-300" 
                        title={t('delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const buildApiUrl = (path: string) => `${apiBaseUrl}${path}`;

const NodesView = ({ nodes, onAction, token }: { nodes: Node[], onAction: any, token: string }) => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [yamlMode, setYamlMode] = useState<'file' | 'text'>('file');
  const [yamlFile, setYamlFile] = useState<File | null>(null);
  const [yamlContent, setYamlContent] = useState('');

  const [formData, setFormData] = useState({
    protocol: 'VMess',
    host: '',
    port: 443,
    region: 'Global',
    tags: ''
  });

  useEffect(() => {
    if (editingNode) {
      setFormData({
        protocol: editingNode.protocol,
        host: editingNode.host,
        port: editingNode.port,
        region: editingNode.region,
        tags: editingNode.tags.join(', ')
      });
    } else {
      setFormData({ protocol: 'VMess', host: '', port: 443, region: 'Global', tags: '' });
    }
  }, [editingNode]);

  const fetchMetrics = async (id: string) => {
    try {
      const res = await fetch(buildApiUrl(`/api/nodes/${id}/metrics`), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('failed_metrics');
      const data = await res.json();
      const samples = Array.isArray(data?.samples) ? data.samples : [];
      const chartData = samples
        .map((sample: any) => ({
          time: new Date(sample.timestamp).toLocaleTimeString(),
          latency: sample.latencyMs ?? 0
        }))
        .slice(-30);
      setMetrics(chartData);
    } catch {
      setMetrics([]);
      toast.error(t('actionFailed'));
    }
  };

  const applyYamlToForm = (content: string) => {
    try {
      const parsed = extractNodeYamlFields(content);
      setFormData({
        protocol: parsed.protocol ?? formData.protocol,
        host: parsed.host ?? formData.host,
        port: parsed.port ?? formData.port,
        region: parsed.region ?? formData.region,
        tags: parsed.tags ?? formData.tags,
      });
      toast.success(t('parsed'));
    } catch {
      toast.error(t('invalidYaml'));
    }
  };

  const handleYamlFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    const file = event.target.files[0];
    setYamlFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result ?? '');
      setYamlContent(content);
      applyYamlToForm(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
    const payload = { ...formData, tags: tagsArray };

    if (editingNode) {
      onAction('nodes', editingNode.id, 'update', payload);
    } else {
      onAction('nodes', null, 'create', payload);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNode(null);
    setFormData({ protocol: 'VMess', host: '', port: 443, region: 'Global', tags: '' });
    setYamlMode('file');
    setYamlFile(null);
    setYamlContent('');
  };

  const confirmDelete = () => {
    if (nodeToDelete) {
      onAction('nodes', nodeToDelete, 'delete');
      setIsDeleteModalOpen(false);
      setNodeToDelete(null);
      if (selectedNode?.id === nodeToDelete) setSelectedNode(null);
    }
  };

  const filteredNodes = useMemo(() => nodes.filter(n => 
    n.host.toLowerCase().includes(search.toLowerCase())
  ), [nodes, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('nodes')}</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Monitor and manage your worldwide network nodes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t('searchNodes')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-muted-foreground hover:text-slate-900 dark:hover:text-foreground shadow-sm transition-all">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => {
              setEditingNode(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-accent/10 transition-all duration-300 whitespace-nowrap"
          >
            <Plus size={16} />
            {t('nodeManagement')}
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingNode ? t('editNode') : t('addNode')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('protocol')}</label>
              <select 
                value={formData.protocol}
                onChange={e => setFormData({...formData, protocol: e.target.value})}
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              >
                <option value="VMess">VMess</option>
                <option value="VLESS">VLESS</option>
                <option value="Trojan">Trojan</option>
                <option value="Shadowsocks">Shadowsocks</option>
                <option value="Hysteria2">Hysteria2</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('region')}</label>
              <select 
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value})}
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              >
                <option value="Global">Global</option>
                <option value="US East">US East</option>
                <option value="US West">US West</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('host')}</label>
              <input 
                required
                type="text" 
                value={formData.host}
                onChange={e => setFormData({...formData, host: e.target.value})}
                placeholder="e.g. node1.example.com"
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('port')}</label>
              <input 
                required
                type="number" 
                min="1"
                max="65535"
                value={formData.port}
                onChange={e => setFormData({...formData, port: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{t('tags')} ({t('commaSeparated')})</label>
            <input 
              type="text" 
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              placeholder="e.g. high-speed, premium"
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">{t('importYaml')}</label>
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setYamlMode('file')}
                className={cn(
                  "flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                  yamlMode === 'file' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('selectFile')}
              </button>
              <button
                type="button"
                onClick={() => setYamlMode('text')}
                className={cn(
                  "flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all",
                  yamlMode === 'text' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t('yamlInput')}
              </button>
            </div>
            {yamlMode === 'file' ? (
              <div>
                <input
                  type="file"
                  accept=".yaml,.yml"
                  id="node-yaml-upload"
                  onChange={handleYamlFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="node-yaml-upload"
                  className="flex flex-col items-center justify-center gap-2 w-full py-6 bg-muted/40 border border-border rounded-xl cursor-pointer hover:bg-muted/60 transition-all"
                >
                  <FileUp size={22} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{yamlFile ? yamlFile.name : t('selectFile')}</span>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={yamlContent}
                  onChange={(event) => setYamlContent(event.target.value)}
                  placeholder="protocol: VMess&#10;host: node1.example.com&#10;port: 443&#10;region: Global&#10;tags: [premium, hk]"
                  className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all h-28 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => applyYamlToForm(yamlContent)}
                  className="w-full py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  {t('applyYaml')}
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={closeModal}
              className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-all"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('confirmDelete')}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('deleteNodeWarning')}
          </p>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={confirmDelete}
              className="flex-1 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 transition-colors duration-300">
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('protocol')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('hostRegion')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('status')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('health')}</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredNodes.map((n) => (
                  <tr 
                    key={n.id} 
                    className={cn("hover:bg-muted/50 transition-colors duration-300 cursor-pointer", selectedNode?.id === n.id && "bg-muted")}
                    onClick={() => {
                      setSelectedNode(n);
                      fetchMetrics(n.id);
                    }}
                  >
                    <td className="px-6 py-4">
                      <Badge variant="info">{n.protocol}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{n.host}</div>
                      <div className="text-xs text-muted-foreground">{n.region}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", n.status === 'online' ? "bg-emerald-500" : "bg-rose-500")} />
                        <span className="text-sm capitalize">{n.status === 'online' ? t('online') : t('offline')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <span className="font-bold">{n.latency}ms</span> / {n.packetLoss}% {t('loss')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction('nodes', n.id, 'update', { active: !n.active });
                          }}
                          className={cn(
                            "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border", 
                            n.active 
                              ? "bg-tag-success-bg text-tag-success-text border-tag-success-border hover:bg-tag-success-border/50" 
                              : "bg-muted text-muted-foreground border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          )}
                        >
                          {n.active ? t('active') : t('disabled')}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNode(n);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors duration-300" 
                          title={t('edit')}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setNodeToDelete(n.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-rose-600 transition-colors duration-300" 
                          title={t('delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{t('nodeDetails')}</h3>
                    <button 
                      onClick={() => onAction('nodes', selectedNode.id, 'update', { host: selectedNode.host + ' (Edited)' })}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-300"
                    >
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg border border-border transition-colors duration-300">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('protocol')}</p>
                        <p className="text-sm font-bold">{selectedNode.protocol}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg border border-border transition-colors duration-300">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('region')}</p>
                        <p className="text-sm font-bold">{selectedNode.region}</p>
                      </div>
                    </div>

                    <div className="h-[200px] w-full">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">{t('latencyHistory')} (ms)</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics}>
                          <defs>
                            <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="time" hide />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: 'var(--foreground)' }}
                          />
                          <Area type="monotone" dataKey="latency" stroke="var(--foreground)" fillOpacity={1} fill="url(#colorLat)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => onAction('nodes', selectedNode.id, 'update', { active: !selectedNode.active })}
                        className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all duration-300"
                      >
                        {selectedNode.active ? t('deactivate') : t('activate')}
                      </button>
                      <button 
                        onClick={() => onAction('nodes', selectedNode.id, 'delete')}
                        className="px-4 py-2 border border-rose-200 text-rose-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors duration-300"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="p-12 text-center text-muted-foreground italic text-sm transition-colors duration-300">
                {t('selectNodePrompt')}
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const PlansView = ({ plans, subscriptions, onAction }: { plans: Plan[], subscriptions: Subscription[], onAction: any }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    days: 30,
    limit: 100,
    devices: 2,
    rules: ''
  });

  const filteredPlans = useMemo(() => plans.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  ), [plans, search]);

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name,
        days: editingPlan.days,
        limit: editingPlan.limit,
        devices: editingPlan.devices,
        rules: editingPlan.rules
      });
    } else {
      setFormData({ name: '', days: 30, limit: 100, devices: 2, rules: '' });
    }
  }, [editingPlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      onAction('plans', editingPlan.id, 'update', formData);
    } else {
      onAction('plans', null, 'create', formData);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData({ name: '', days: 30, limit: 100, devices: 2, rules: '' });
  };

  const confirmDelete = () => {
    if (planToDelete) {
      onAction('plans', planToDelete, 'delete');
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('plans')}</h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Create and manage access tiers for your users</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
              <input 
                type="text"
                placeholder={t('search')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={() => {
                setEditingPlan(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-accent/10 transition-all duration-300 whitespace-nowrap"
            >
              <Plus size={16} />
              {t('createNewPlan')}
            </button>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingPlan ? t('editPlan') : t('createNewPlan')}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('name')}</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Premium Monthly"
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('days')}</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  value={formData.days}
                  onChange={e => setFormData({...formData, days: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">{t('maxDevices')}</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  value={formData.devices}
                  onChange={e => setFormData({...formData, devices: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('trafficLimit')} (GB)</label>
              <input 
                required
                type="number" 
                min="1"
                value={formData.limit}
                onChange={e => setFormData({...formData, limit: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('rules')}</label>
              <textarea 
                value={formData.rules}
                onChange={e => setFormData({...formData, rules: e.target.value})}
                placeholder="e.g. No P2P, 500Mbps speed limit"
                className="w-full px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all h-24 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={closeModal}
                className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                type="submit"
                className="flex-1 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-all"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={t('confirmDelete')}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('deletePlanWarning')}
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </Modal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(p => (
            <Card key={p.id} className="p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-slate-50 dark:bg-muted rounded-xl border border-slate-100 dark:border-none">
                  <CreditCard size={24} className="text-foreground" />
                </div>
                <Badge variant="info" hierarchy="secondary">{p.days} {t('days')}</Badge>
              </div>
              <div className="space-y-1 mb-6">
                <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                <p className="text-xs text-muted-foreground font-medium italic">{p.rules || 'No special rules'}</p>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-muted/30 rounded-xl border border-slate-100/50 dark:border-none/50">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-muted-foreground">{t('trafficLimit')}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{p.limit} GB</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-muted/30 rounded-xl border border-slate-100/50 dark:border-none/50">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-muted-foreground">{t('maxDevices')}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{p.devices}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-none">
                <button 
                  onClick={() => {
                    setEditingPlan(p);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-muted text-foreground rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors duration-300"
                >
                  {t('edit')}
                </button>
                <button 
                  onClick={() => {
                    setPlanToDelete(p.id);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-none text-muted-foreground dark:text-muted-foreground rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {t('delete')}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('subscriptions')}</h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Monitor active service plans for each user</p>
          </div>
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t('searchUsers')}
              className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
            />
          </div>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border transition-colors duration-300">
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('user')}</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('plan')}</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('status')}</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('usage')}</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('expiry')}</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscriptions.map(s => (
                  <tr key={s.id} className="hover:bg-muted/50 transition-colors duration-300">
                    <td className="p-4 text-sm font-medium">{s.user}</td>
                    <td className="p-4 text-sm text-muted-foreground">{s.plan}</td>
                    <td className="p-4">
                      <Badge variant={s.status === 'Active' ? 'success' : s.status === 'Expired' ? 'danger' : 'warning'}>
                        {s.status === 'Active' ? t('active') : s.status === 'Expired' ? t('expired') : t('banned')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="w-full max-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                        <div 
                          className={cn("h-full transition-all duration-500", s.used/s.total > 0.9 ? "bg-rose-500" : "bg-accent")} 
                          style={{ width: `${(s.used/s.total) * 100}%` }} 
                        />
                      </div>
                      <div className="text-[10px] text-muted-foreground font-bold">{s.used} / {s.total} GB</div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{s.expiry}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onAction('subscriptions', s.id, 'update', { expiry: '2025-01-01' })}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300" 
                          title={t('adjustExpiry')}
                        >
                          <Clock size={16} />
                        </button>
                        <button 
                          onClick={() => onAction('subscriptions', s.id, 'update', { used: 0 })}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300" 
                          title={t('resetTraffic')}
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button 
                          onClick={() => onAction('subscriptions', s.id, 'update', { status: s.status === 'Active' ? 'Suspended' : 'Active' })}
                          className="p-2 text-muted-foreground hover:text-rose-600 transition-colors duration-300" 
                          title={s.status === 'Active' ? t('ban') : t('unban')}
                        >
                          {s.status === 'Active' ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

const TicketsView = ({ tickets, onAction }: { tickets: Ticket[], onAction: any }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredTickets = useMemo(() => tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [tickets, searchQuery, statusFilter]);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    
    onAction('tickets', selectedTicket.id, 'reply', { content: replyText });
    setReplyText('');
  };

  // Update selected ticket when tickets list changes (to show new messages)
  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets, selectedTicket?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('tickets')}</h2>
          <div className="flex gap-2">
            <Badge variant="info" hierarchy="secondary">{t('open')}: {tickets.filter(t => t.status === 'Open').length}</Badge>
            <Badge variant="warning" hierarchy="secondary">{t('pending')}: {tickets.filter(t => t.status === 'Pending').length}</Badge>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchTickets')}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
          >
            <option value="all">{t('allStatus')}</option>
            <option value="Open">{t('open')}</option>
            <option value="Pending">{t('pending')}</option>
            <option value="Resolved">{t('resolved')}</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border transition-colors duration-300">
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('subject')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('priority')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('status')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('node')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('created')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-muted/50 transition-colors duration-300 group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{ticket.subject}</span>
                      <span className="text-[10px] text-muted-foreground">#{ticket.id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={ticket.priority === 'Urgent' ? 'danger' : ticket.priority === 'High' ? 'warning' : 'default'}>
                      {ticket.priority === 'Urgent' ? t('urgent') : ticket.priority === 'High' ? t('high') : t('normal')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", ticket.status === 'Open' ? "bg-emerald-500" : ticket.status === 'Pending' ? "bg-amber-500" : "bg-muted-foreground")} />
                      <span className="text-xs text-muted-foreground">{ticket.status === 'Open' ? t('open') : ticket.status === 'Pending' ? t('pending') : t('resolved')}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{ticket.node}</td>
                  <td className="p-4 text-xs text-muted-foreground">{ticket.createdAt}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-4 py-2 bg-accent text-accent-foreground rounded-xl text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all duration-300"
                      >
                        {t('view')}
                      </button>
                      <button 
                        onClick={() => onAction('tickets', ticket.id, 'update', { status: 'Resolved' })}
                        className="p-2 text-muted-foreground hover:text-emerald-600 transition-colors duration-300" 
                        title={t('resolve')}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground italic text-sm">
                    {t('noTicketsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.subject || ''}
      >
        <div className="flex flex-col h-full max-h-[70vh]">
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-xl border border-border shrink-0">
            <div className="flex gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t('status')}</p>
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", selectedTicket?.status === 'Open' ? "bg-emerald-500" : selectedTicket?.status === 'Pending' ? "bg-amber-500" : "bg-muted-foreground")} />
                  <span className="text-sm font-medium">{selectedTicket?.status}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t('priority')}</p>
                <Badge variant={selectedTicket?.priority === 'Urgent' ? 'danger' : selectedTicket?.priority === 'High' ? 'warning' : 'default'}>
                  {selectedTicket?.priority}
                </Badge>
              </div>
            </div>
            <select 
              value={selectedTicket?.status}
              onChange={(e) => onAction('tickets', selectedTicket?.id, 'update', { status: e.target.value })}
              className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <option value="Open">{t('open')}</option>
              <option value="Pending">{t('pending')}</option>
              <option value="Resolved">{t('resolved')}</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
            {selectedTicket?.messages?.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === 'support' ? "ml-auto items-end" : "items-start")}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground">{msg.sender}</span>
                  <span className="text-[10px] text-muted-foreground/60">{msg.timestamp}</span>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-2xl text-sm transition-colors duration-300",
                  msg.role === 'support' 
                    ? "bg-accent text-accent-foreground rounded-tr-none" 
                    : "bg-muted text-foreground rounded-tl-none border border-border"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {!selectedTicket?.messages?.length && (
              <div className="text-center py-8 text-muted-foreground italic text-sm">
                {t('noMessages')}
              </div>
            )}
          </div>

          <form onSubmit={handleReply} className="mt-auto pt-4 border-t border-border shrink-0">
            <div className="flex gap-2">
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t('typeYourReply')}
                className="flex-1 px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none h-20 text-sm"
              />
              <button 
                type="submit"
                disabled={!replyText.trim()}
                className="px-4 bg-accent text-accent-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

const AlertsView = ({ alerts, onAction }: { alerts: Alert[], onAction: any }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('alerts')}</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Configure and monitor automated system notifications</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-semibold hover:opacity-90 shadow-lg shadow-accent/10 transition-all duration-300 whitespace-nowrap">
          <Plus size={16} />
          {t('newRule')}
        </button>
      </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {alerts.map(a => (
              <Card key={a.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300 border", 
                      a.severity === 'Critical' 
                        ? "bg-tag-danger-bg text-tag-danger-text border-tag-danger-border" 
                        : "bg-tag-warning-bg text-tag-warning-text border-tag-warning-border"
                    )}>
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold">{a.name}</h3>
                      <p className="text-xs text-muted-foreground">{a.channel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300", a.active ? "bg-emerald-500" : "bg-muted")}>
                      <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300", a.active ? "left-6" : "left-1")} />
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg space-y-2 border border-border transition-colors duration-300">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-bold uppercase">{t('threshold')}</span>
                    <span className="font-medium">{a.threshold}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-bold uppercase">{t('target')}</span>
                    <span className="font-medium">{a.target}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-card border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors duration-300">{t('testTrigger')}</button>
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-300"><Edit size={16} /></button>
                  <button className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors duration-300"><Trash2 size={16} /></button>
                </div>
              </Card>
            ))}
          </div>
    </div>
  );
};

const UsersView = ({ users, onAction }: { users: User[], onAction: any }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'management' | 'user'>('management');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: '', email: '', role: '' });
  const [addForm, setAddForm] = useState({ nickname: '', email: '', role: 'user', status: 'Active' });

  const filteredUsers = useMemo(() => users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.nickname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    const isManagementRole = ['super_admin', 'ops', 'support', 'auditor'].includes(u.role);
    const matchesViewMode = viewMode === 'management' ? isManagementRole : u.role === 'user';
    
    return matchesSearch && matchesRole && matchesViewMode;
  }), [users, searchQuery, roleFilter, viewMode]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({ nickname: user.nickname, email: user.email, role: user.role });
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      onAction('users', selectedUser.id, 'update', editForm);
      setIsEditModalOpen(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAction('users', null, 'create', addForm);
    setIsAddModalOpen(false);
    setAddForm({ nickname: '', email: '', role: 'user', status: 'Active' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('users')}</h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Manage administrative staff and end-user accounts</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-300 shadow-lg shadow-accent/10 whitespace-nowrap"
          >
            <Plus size={16} />
            {t('addUser') || 'Add User'}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchUsers')}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
          >
            <option value="all">{t('allRoles') || 'All Roles'}</option>
            <option value="super_admin">{t('superAdmin')}</option>
            <option value="ops">{t('ops')}</option>
            <option value="support">{t('support') || 'Support'}</option>
            <option value="auditor">{t('auditor') || 'Auditor'}</option>
            <option value="user">{t('user')}</option>
          </select>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-muted/50 w-fit rounded-xl border border-border">
        <button 
          onClick={() => setViewMode('management')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300",
            viewMode === 'management' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t('managementTab') || 'Management'}
        </button>
        <button 
          onClick={() => setViewMode('user')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300",
            viewMode === 'user' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t('userTab') || 'User'}
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border transition-colors duration-300">
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('email')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('nickname')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('role')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('status')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-muted/50 transition-colors duration-300 group">
                  <td className="p-4 text-sm font-medium">{u.email}</td>
                  <td className="p-4 text-sm text-muted-foreground">{u.nickname}</td>
                  <td className="p-4">
                    <Badge variant={u.role === 'super_admin' ? 'danger' : u.role === 'ops' ? 'warning' : 'info'}>
                      {u.role === 'super_admin' ? t('superAdmin') : u.role === 'ops' ? t('ops') : t('user')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={u.status === 'Active' ? 'success' : 'default'}>
                      {u.status === 'Active' ? t('active') : t('ban')}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300" 
                        title={t('edit')}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onAction('users', u.id, 'update', { status: u.status === 'Active' ? 'Banned' : 'Active' })}
                        className={cn(
                          "p-2 transition-colors duration-300",
                          u.status === 'Active' ? "text-muted-foreground hover:text-rose-600" : "text-emerald-500 hover:text-emerald-600"
                        )}
                        title={u.status === 'Active' ? t('ban') : t('activate')}
                      >
                        {u.status === 'Active' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                      <button 
                        onClick={() => onAction('users', u.id, 'delete')}
                        className="p-2 text-muted-foreground hover:text-rose-600 transition-colors duration-300" 
                        title={t('delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground italic text-sm">
                    {t('noUsersFound') || 'No users found matching your criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('editUser') || 'Edit User'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('email')}</label>
            <input 
              type="email" 
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('nickname')}</label>
            <input 
              type="text" 
              value={editForm.nickname}
              onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('role')}</label>
            <select 
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <option value="super_admin">{t('superAdmin')}</option>
              <option value="ops">{t('ops')}</option>
              <option value="support">{t('support') || 'Support'}</option>
              <option value="auditor">{t('auditor') || 'Auditor'}</option>
              <option value="user">{t('user')}</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-6 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-all"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('addUser') || 'Add User'}
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('email')}</label>
            <input 
              type="email" 
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              placeholder="user@example.com"
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('nickname')}</label>
            <input 
              type="text" 
              value={addForm.nickname}
              onChange={(e) => setAddForm({ ...addForm, nickname: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('role')}</label>
            <select 
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
              className="w-full px-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <option value="super_admin">{t('superAdmin')}</option>
              <option value="ops">{t('ops')}</option>
              <option value="support">{t('support') || 'Support'}</option>
              <option value="auditor">{t('auditor') || 'Auditor'}</option>
              <option value="user">{t('user')}</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-6 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-all"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const AuditLogsView = ({ logs }: { logs: AuditLog[] }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filteredLogs = useMemo(() => logs.filter(l => 
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.targetId.toLowerCase().includes(search.toLowerCase())
  ), [logs, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('audit')}</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Track administrative actions across the system</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-card border border-slate-200/60 dark:border-none rounded-xl px-4 py-2.5 text-sm transition-all shadow-sm">
            <Clock size={16} className="text-slate-400" />
            <span className="text-slate-600 dark:text-muted-foreground font-medium">Last 24 Hours</span>
          </div>
          <div className="relative group w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t('searchOperator')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-card border border-slate-200/60 dark:border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
            />
          </div>
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border transition-colors duration-300">
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('operator')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('action')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('target')}</th>
                <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('time')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-muted/50 transition-colors duration-300">
                  <td className="p-4 text-sm font-medium">{l.user}</td>
                  <td className="p-4">
                    <span className="text-sm font-medium">{l.action}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">{l.targetType}</Badge>
                      <span className="text-xs text-muted-foreground">#{l.targetId}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { t, i18n } = useTranslation();
  const { adminToken, loginAdmin, logout, adminEmail, userRole } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  const [nodeStream, setNodeStream] = useState<any[]>([]);
  const [alertStream, setAlertStream] = useState<any[]>([]);

  const apiRequest = async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers ?? {});
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }
    if (adminToken) {
      headers.set('Authorization', `Bearer ${adminToken}`);
    }
    const res = await fetch(buildApiUrl(path), { ...options, headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP_${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const result = await fetch(buildApiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (!result.ok) throw new Error('login_failed');
      const data = await result.json();
      const role = (data.user?.role ?? 'user') as UserRole;
      loginAdmin(data.accessToken, email, data.user?.nickname ?? email, role);
      toast.success('登录成功');
    } catch {
      toast.error('登录失败');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAction = async (resource: string, id: string | null, action: 'create' | 'update' | 'delete' | 'sync' | 'reply', data?: any) => {
    try {
      if (resource === 'providers') {
        const payload = data
          ? {
              name: data.name,
              regionHint: data.regionHint,
              syncIntervalMinutes: data.syncIntervalMinutes,
              subscriptionUrl: data.subscriptionUrl,
              tags: data.tags ?? [],
            }
          : undefined;
        if (action === 'create') await apiRequest('/api/providers', { method: 'POST', body: JSON.stringify(payload) });
        if (action === 'update') await apiRequest(`/api/providers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        if (action === 'delete') await apiRequest(`/api/providers/${id}`, { method: 'DELETE' });
        if (action === 'sync') await apiRequest(`/api/providers/${id}/sync`, { method: 'POST' });
      } else if (resource === 'plans') {
        const payload = data
          ? {
              name: data.name,
              bandwidthLimitGb: data.limit,
              durationDays: data.days,
              concurrentDevices: data.devices,
              regionFilters: [],
              nodeTags: data.rules
                ? String(data.rules)
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                : [],
            }
          : undefined;
        if (action === 'create') await apiRequest('/api/plans', { method: 'POST', body: JSON.stringify(payload) });
        if (action === 'update') await apiRequest(`/api/plans/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        if (action === 'delete') await apiRequest(`/api/plans/${id}`, { method: 'DELETE' });
      } else if (resource === 'nodes') {
        const protocolMap: Record<string, string> = {
          VMess: 'vmess',
          VLESS: 'vless',
          Trojan: 'trojan',
          Shadowsocks: 'ss',
          Hysteria2: 'vless',
        };
        const payload = data
          ? {
              providerId: providers[0]?.id,
              hostname: data.host ?? data.hostname,
              port: data.port,
              protocol: protocolMap[data.protocol] ?? String(data.protocol ?? '').toLowerCase(),
              region: data.region,
              tags: data.tags ?? [],
              active: data.active,
            }
          : undefined;
        if (action === 'create') await apiRequest('/api/nodes', { method: 'POST', body: JSON.stringify(payload) });
        if (action === 'update') await apiRequest(`/api/nodes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        if (action === 'delete') await apiRequest(`/api/nodes/${id}`, { method: 'DELETE' });
      } else if (resource === 'subscriptions') {
        if (action === 'delete') await apiRequest(`/api/subscriptions/${id}`, { method: 'DELETE' });
        else toast.info('当前后端暂不支持此订阅操作');
      } else if (resource === 'tickets') {
        if (action === 'update' && id) {
          const statusMap: Record<string, string> = { Open: 'open', Pending: 'pending', Resolved: 'resolved' };
          const priorityMap: Record<string, string> = { Low: 'low', Medium: 'medium', High: 'high', Urgent: 'critical' };
          const payload: Record<string, unknown> = {};
          if (data?.status) payload.status = statusMap[data.status] ?? String(data.status).toLowerCase();
          if (data?.priority) payload.priority = priorityMap[data.priority] ?? String(data.priority).toLowerCase();
          await apiRequest(`/api/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        }
        if (action === 'reply' && id) {
          await apiRequest(`/api/tickets/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ body: data?.content ?? data?.body ?? '' }),
          });
        }
      } else if (resource === 'users') {
        const payload: Record<string, unknown> = {};
        if (data?.email !== undefined) payload.email = data.email;
        if (data?.nickname !== undefined) payload.displayName = data.nickname;
        if (data?.role !== undefined) payload.role = data.role;
        if (action === 'create') payload.password = data?.password || 'ChangeMe123!';
        if (action === 'update' && data?.password) payload.password = data.password;
        if (action === 'create') await apiRequest('/api/users', { method: 'POST', body: JSON.stringify(payload) });
        if (action === 'update') await apiRequest(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        if (action === 'delete') await apiRequest(`/api/users/${id}`, { method: 'DELETE' });
      } else if (resource === 'alerts' && action === 'sync' && id) {
        await apiRequest(`/api/alerts/${id}/trigger`, {
          method: 'POST',
          body: JSON.stringify({ message: 'manual trigger' }),
        });
      } else {
        toast.info('当前后端暂不支持此操作');
        return;
      }
      
      toast.success(t('actionSuccess'));
      fetchData();
    } catch {
      toast.error(t('actionFailed'));
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  const fetchData = async () => {
    try {
      const [nodesResp, providersResp, plansResp, subsResp, ticketsResp, alertsResp, usersResp] = await Promise.all([
        apiRequest('/api/nodes?page=1&pageSize=200'),
        apiRequest('/api/providers'),
        apiRequest('/api/plans'),
        apiRequest('/api/subscriptions'),
        apiRequest('/api/tickets?page=1&pageSize=200'),
        apiRequest('/api/alerts'),
        apiRequest('/api/users?page=1&pageSize=200'),
      ]);

      const mappedNodes: Node[] = (nodesResp.data ?? []).map((node: any) => ({
        id: node.id,
        protocol: String(node.protocol ?? '').toUpperCase(),
        host: node.host,
        port: node.port,
        region: node.region,
        status: node.status === 'online' ? 'online' : 'offline',
        active: Boolean(node.active),
        latency: node.latency ?? 0,
        packetLoss: Math.round((node.packetLoss ?? 0) * 100),
        tags: node.tags ?? [],
      }));

      const mappedProviders: Provider[] = (providersResp ?? []).map((provider: any) => ({
        id: provider.id,
        name: provider.name,
        url: provider.url,
        region: provider.region,
        interval: provider.interval,
        lastSync: provider.lastSync ? new Date(provider.lastSync).toLocaleString() : '-',
        tags: provider.tags ?? [],
      }));

      const mappedPlans: Plan[] = (plansResp ?? []).map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        limit: plan.bandwidthLimitGb,
        days: plan.durationDays,
        devices: plan.concurrentDevices,
        rules: Array.isArray(plan.nodeTags) ? plan.nodeTags.join(', ') : '',
      }));

      const mappedSubscriptions: Subscription[] = (subsResp ?? []).map((subscription: any) => ({
        id: subscription.id,
        user: subscription.user?.displayName || subscription.user?.email || subscription.userId,
        plan: subscription.plan?.name || subscription.planId,
        status:
          subscription.status === 'active'
            ? 'Active'
            : subscription.status === 'expired'
            ? 'Expired'
            : 'Suspended',
        used: Math.round(subscription.used ?? 0),
        total: subscription.total ?? 0,
        expiry: new Date(subscription.expiresAt).toLocaleDateString(),
      }));

      const mappedTickets: Ticket[] = (ticketsResp.data ?? []).map((ticket: any) => ({
        id: ticket.id,
        subject: ticket.subject,
        priority:
          ticket.priority === 'critical' ? 'Urgent' : ticket.priority === 'high' ? 'High' : ticket.priority === 'medium' ? 'Medium' : 'Low',
        status: ticket.status === 'open' ? 'Open' : ticket.status === 'pending' ? 'Pending' : 'Resolved',
        node: ticket.nodeId ?? '-',
        createdAt: new Date(ticket.createdAt).toLocaleString(),
        messages: (ticket.messages ?? []).map((message: any) => ({
          id: message.id,
          sender: message.sender === 'admin' ? 'Support' : 'User',
          role: message.sender === 'admin' ? 'support' : 'user',
          content: message.body,
          timestamp: new Date(message.createdAt).toLocaleString(),
        })),
      }));

      const mappedAlerts: Alert[] = (alertsResp ?? []).map((alert: any) => ({
        id: alert.id,
        name: alert.name,
        channel: alert.channel,
        severity: alert.severity === 'critical' ? 'Critical' : 'Warning',
        threshold:
          alert.thresholdLatencyMs != null
            ? `latency > ${alert.thresholdLatencyMs}ms`
            : alert.thresholdPacketLoss != null
            ? `loss > ${Math.round(alert.thresholdPacketLoss * 100)}%`
            : '-',
        target: [alert.regionFilter, alert.tagFilter].filter(Boolean).join(' / ') || 'all',
        active: true,
      }));

      const mappedUsers: User[] = (usersResp.data ?? []).map((user: any) => ({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        status: user.status === 'Active' ? 'Active' : 'Banned',
      }));

      const nextStats: Stats = {
        totalNodes: mappedNodes.length,
        onlineNodes: mappedNodes.filter((node) => node.status === 'online').length,
        activeSubs: mappedSubscriptions.filter((subscription) => subscription.status === 'Active').length,
        pendingTickets: mappedTickets.filter((ticket) => ticket.status !== 'Resolved').length,
      };

      setStats(nextStats);
      setNodes(mappedNodes);
      setProviders(mappedProviders);
      setPlans(mappedPlans);
      setSubscriptions(mappedSubscriptions);
      setTickets(mappedTickets);
      setAlerts(mappedAlerts);
      setUsers(mappedUsers);
      setAuditLogs([]);
    } catch {
      toast.error('数据加载失败');
    }
  };

  useEffect(() => {
    if (!adminToken) return;
    fetchData();

    const nodeEvt = new EventSource(buildApiUrl(`/api/stream/nodes?token=${encodeURIComponent(adminToken)}`));
    nodeEvt.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const payload = data?.payload ?? data;
      setNodeStream(prev => [
        {
          time: new Date().toLocaleTimeString(),
          node: payload?.hostname ?? payload?.nodeId ?? payload?.node ?? 'node',
          action: payload?.online === false ? 'Offline' : 'Online',
        },
        ...prev,
      ].slice(0, 20));
    };

    const alertEvt = new EventSource(buildApiUrl(`/api/stream/alerts?token=${encodeURIComponent(adminToken)}`));
    alertEvt.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const payload = data?.payload ?? data;
      setAlertStream(prev => [
        {
          time: new Date().toLocaleTimeString(),
          name: payload?.name ?? payload?.message ?? 'alert',
          severity: payload?.severity === 'critical' ? 'Critical' : 'Warning',
        },
        ...prev,
      ].slice(0, 20));
    };

    return () => {
      nodeEvt.close();
      alertEvt.close();
    };
  }, [adminToken]);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'providers', label: t('providers'), icon: Network },
    { id: 'nodes', label: t('nodes'), icon: Server },
    { id: 'plans', label: t('plans'), icon: CreditCard },
    { id: 'tickets', label: t('tickets'), icon: TicketIcon },
    { id: 'alerts', label: t('alerts'), icon: Bell },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'audit', label: t('audit'), icon: History },
  ];

  if (!adminToken) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginView 
          email={email} 
          setEmail={setEmail} 
          password={password} 
          setPassword={setPassword} 
          isLoggingIn={isLoggingIn} 
          handleLogin={handleLogin} 
        />
      </>
    );
  }

  // Route regular users to their dedicated portal
  if (userRole === 'user') {
    return <UserPortal />;
  }

  return (
    <div className="flex h-screen bg-background font-sans text-foreground transition-colors duration-300 overflow-hidden">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {(sidebarOpen && window.innerWidth < 1024) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "bg-mid-layer border-r border-border dark:border-none flex flex-col transition-all duration-300 z-50",
        "fixed inset-y-0 left-0 lg:relative lg:translate-x-0",
        sidebarOpen ? "w-[250px] translate-x-0" : "w-0 lg:w-[64px] -translate-x-full lg:translate-x-0"
      )}>
        <div className={cn(
          "p-6 flex items-center gap-3 transition-all duration-300 overflow-hidden shrink-0",
          sidebarOpen ? "justify-between" : "justify-center px-0"
        )}>
          <div className="flex items-center gap-3 shrink-0">
            <BrandLogo size={36} className="shrink-0" />
            {sidebarOpen && (
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-black tracking-tight whitespace-nowrap text-foreground flex items-center gap-1.5"
              >
                NodeAdmin
                <span className="brand-gradient text-[10px] font-black px-1.5 py-0.5 rounded text-white">PRO</span>
              </motion.h1>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 lg:hidden hover:bg-muted rounded-lg transition-colors shrink-0"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group relative",
                activeView === item.id 
                  ? "bg-brand-light text-brand dark:text-blue-400 shadow-sm nav-active-indicator" 
                  : "text-muted-foreground hover:text-foreground hover:bg-brand-light/50 dark:hover:bg-slate-800/50",
                !sidebarOpen && "justify-center px-0"
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {!sidebarOpen && (
                <div className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap border border-border">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className={cn("p-4 border-t border-border dark:border-none mt-auto shrink-0 transition-all", !sidebarOpen && "px-2")}>
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors duration-300 overflow-hidden",
            !sidebarOpen && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-xs font-bold text-white transition-colors duration-300 shrink-0 shadow-md shadow-blue-600/20">AD</div>
            {sidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-bold truncate">Admin</p>
                <p className="text-[10px] text-muted-foreground truncate">{adminEmail || email}</p>
              </motion.div>
            )}
            {sidebarOpen && (
              <button onClick={logout} className="p-1 text-muted-foreground hover:text-rose-500 transition-colors duration-300 shrink-0">
                <MoreVertical size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden transition-colors duration-300">
        <header className="h-16 bg-mid-layer border-b border-border dark:border-none flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-colors duration-300 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors flex items-center justify-center"
              title={sidebarOpen ? t('collapse') : t('expand')}
            >
              <Menu size={20} className="text-muted-foreground" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('admin')}</span>
              <ChevronRight size={14} />
              <span className="text-foreground font-medium capitalize">{activeView.replace('-', ' ')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-4">
            <button 
              onClick={toggleLanguage}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
              title="Switch Language"
            >
              <Languages size={20} />
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground relative transition-colors duration-300">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-card" />
            </button>
            <div className="hidden md:block h-8 w-[1px] bg-border transition-colors duration-300" />
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="success">{t('systemHealthy')}</Badge>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeView === 'dashboard' && <DashboardView stats={stats} nodeStream={nodeStream} alertStream={alertStream} onRefresh={fetchData} />}
                {activeView === 'providers' && <ProvidersView providers={providers} onAction={handleAction} />}
                {activeView === 'nodes' && <NodesView nodes={nodes} onAction={handleAction} token={adminToken} />}
                {activeView === 'plans' && <PlansView plans={plans} subscriptions={subscriptions} onAction={handleAction} />}
                {activeView === 'tickets' && <TicketsView tickets={tickets} onAction={handleAction} />}
                {activeView === 'alerts' && <AlertsView alerts={alerts} onAction={handleAction} />}
                {activeView === 'users' && <UsersView users={users} onAction={handleAction} />}
                {activeView === 'audit' && <AuditLogsView logs={auditLogs} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Toaster position="top-right" richColors theme={darkMode ? 'dark' : 'light'} />
    </div>
  );
}
