import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Menu
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
import yaml from 'js-yaml';
import { cn } from './lib/utils';
import type { 
  Node, Provider, Plan, Subscription, Ticket, Alert, User, AuditLog, Stats 
} from './types';

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div className={cn("bg-card text-card-foreground border border-border rounded-xl overflow-hidden shadow-sm transition-colors duration-300", className)} {...props}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
  const { t } = useTranslation();
  return (
    <Card className="p-4 sm:p-6 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <div className={cn("flex items-center mt-2 text-xs font-medium", trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg transition-colors duration-300", color)}>
          <Icon size={24} className="text-white dark:text-zinc-900" />
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[85%] md:max-w-lg lg:max-w-2xl bg-card border border-border rounded-2xl shadow-2xl z-[51] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <XCircle size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Views ---

const DashboardView = ({ stats, nodeStream, alertStream, onRefresh }: any) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{t('dashboard')}</h2>
        <button 
          onClick={onRefresh}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors duration-300"
        >
          <RefreshCw size={16} />
          {t('refresh')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title={t('totalNodes')} value={stats?.totalNodes || 0} icon={Network} color="bg-zinc-900 dark:bg-zinc-100" trend={12} />
        <StatCard title={t('onlineNodes')} value={stats?.onlineNodes || 0} icon={Activity} color="bg-emerald-600 dark:bg-emerald-500" trend={5} />
        <StatCard title={t('activeSubs')} value={stats?.activeSubs || 0} icon={CreditCard} color="bg-sky-600 dark:bg-sky-500" trend={-2} />
        <StatCard title={t('pendingTickets')} value={stats?.pendingTickets || 0} icon={TicketIcon} color="bg-amber-500 dark:bg-amber-400" trend={8} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <Card className="flex flex-col h-[400px] lg:col-span-1 xl:col-span-2">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Server size={18} />
              {t('nodeActivity')}
            </h3>
            <Badge variant="info">{t('live')}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {nodeStream.map((log: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/50 border border-border transition-colors duration-300">
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
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldAlert size={18} />
              {t('systemAlerts')}
            </h3>
            <Badge variant="danger">{t('live')}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {alertStream.map((log: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 transition-colors duration-300">
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
          const parsed = yaml.load(content) as any;
          if (parsed && typeof parsed === 'object') {
            setFormData(prev => ({ 
              ...prev, 
              name: parsed.name || prev.name,
              url: parsed.url || prev.url,
              region: parsed.region || prev.region,
              interval: parsed.interval || prev.interval,
              tags: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : (parsed.tags || prev.tags),
              yamlContent: content 
            }));
            toast.success(t('parsed'));
          } else {
            setFormData(prev => ({ ...prev, yamlContent: content }));
            toast.success(t('loaded'));
          }
        } catch (err) {
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
      const parsed = yaml.load(formData.yamlContent) as any;
      if (parsed && typeof parsed === 'object') {
        setFormData(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          url: parsed.url || prev.url,
          region: parsed.region || prev.region,
          interval: parsed.interval || prev.interval,
          tags: Array.isArray(parsed.tags) ? parsed.tags.join(', ') : (parsed.tags || prev.tags)
        }));
        toast.success(t('parsed'));
      }
    } catch (err) {
      toast.error(t('invalidYaml'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
    const payload = { 
      ...formData, 
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('providers')}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text"
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all w-64"
            />
          </div>
          <button 
            onClick={() => {
              setEditingProvider(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300"
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

const NodesView = ({ nodes, onAction }: { nodes: Node[], onAction: any }) => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

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
    const res = await fetch(`/api/nodes/${id}/metrics`);
    const data = await res.json();
    setMetrics(data);
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('nodes')}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder={t('searchNodes')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 w-64"
            />
          </div>
          <button className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors duration-300">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => {
              setEditingNode(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300"
          >
            <Plus size={16} />
            {t('addNode')}
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
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('plans')}</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text"
                placeholder={t('search')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all w-64"
              />
            </div>
            <button 
              onClick={() => {
                setEditingPlan(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300"
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
            <Card key={p.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{p.name}</h3>
                <Badge variant="info">{p.days} {t('days')}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('trafficLimit')}</span>
                  <span className="font-bold">{p.limit} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('maxDevices')}</span>
                  <span className="font-bold">{p.devices}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2 italic">
                  {p.rules}
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <button 
                  onClick={() => {
                    setEditingPlan(p);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-muted text-foreground rounded-lg text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-300"
                >
                  {t('edit')}
                </button>
                <button 
                  onClick={() => {
                    setPlanToDelete(p.id);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex-1 py-2 border border-border rounded-lg text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {t('delete')}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('subscriptions')}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder={t('searchUsers')}
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">{t('tickets')}</h2>
          <div className="flex gap-2">
            <Badge variant="info">{t('open')}: {tickets.filter(t => t.status === 'Open').length}</Badge>
            <Badge variant="warning">{t('pending')}: {tickets.filter(t => t.status === 'Pending').length}</Badge>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchTickets')}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
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
                        className="px-3 py-1.5 bg-accent text-accent-foreground rounded text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all duration-300"
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('alerts')}</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-all duration-300">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">{t('users')}</h2>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent text-accent-foreground rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all duration-300 shadow-lg shadow-accent/10"
          >
            <Plus size={14} />
            {t('addUser') || 'Add User'}
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchUsers')}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{t('audit')}</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm transition-colors duration-300">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Last 24 Hours</span>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder={t('searchOperator')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
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

  const handleAction = async (resource: string, id: string | null, action: 'create' | 'update' | 'delete' | 'sync' | 'reply', data?: any) => {
    try {
      const urlMap = {
        create: `/api/${resource}`,
        update: `/api/${resource}/${id}`,
        delete: `/api/${resource}/${id}`,
        sync: `/api/${resource}/${id}/sync`,
        reply: `/api/${resource}/${id}/reply`
      };

      const methodMap = {
        create: 'POST',
        update: 'PATCH',
        delete: 'DELETE',
        sync: 'POST',
        reply: 'POST'
      };

      const url = urlMap[action];
      const method = methodMap[action];
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!res.ok) throw new Error('Action failed');
      
      toast.success(t('actionSuccess'));
      fetchData();
    } catch (err) {
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
      const [s, n, p, pl, sub, t, a, u, l] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/nodes').then(r => r.json()),
        fetch('/api/providers').then(r => r.json()),
        fetch('/api/plans').then(r => r.json()),
        fetch('/api/subscriptions').then(r => r.json()),
        fetch('/api/tickets').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
      ]);
      setStats(s);
      setNodes(n);
      setProviders(p);
      setPlans(pl);
      setSubscriptions(sub);
      setTickets(t);
      setAlerts(a);
      setUsers(u);
      setAuditLogs(l);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();

    const nodeEvt = new EventSource('/api/stream/nodes');
    nodeEvt.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setNodeStream(prev => [data, ...prev].slice(0, 20));
    };

    const alertEvt = new EventSource('/api/stream/alerts');
    alertEvt.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setAlertStream(prev => [data, ...prev].slice(0, 20));
    };

    return () => {
      nodeEvt.close();
      alertEvt.close();
    };
  }, []);

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

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground transition-colors duration-300 overflow-x-hidden">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
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
        "fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col transition-all duration-300 z-50 lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center transition-colors duration-300">
              <Activity className="text-accent-foreground" size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight">NodeAdmin Pro</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 lg:hidden hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                activeView === item.id 
                  ? "bg-accent text-accent-foreground shadow-lg shadow-accent/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors duration-300 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold transition-colors duration-300">AD</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Admin User</p>
              <p className="text-[10px] text-muted-foreground truncate">admin@example.com</p>
            </div>
            <MoreVertical size={14} className="text-muted-foreground" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden transition-colors duration-300">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 lg:hidden hover:bg-muted rounded-lg transition-colors"
            >
              <Menu size={20} className="text-muted-foreground" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('admin')}</span>
              <ChevronRight size={14} />
              <span className="text-foreground font-medium capitalize">{activeView.replace('-', ' ')}</span>
            </div>
            <div className="sm:hidden font-bold text-sm capitalize">{activeView.replace('-', ' ')}</div>
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

        <div className="flex-1 overflow-y-auto">
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
                {activeView === 'nodes' && <NodesView nodes={nodes} onAction={handleAction} />}
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
