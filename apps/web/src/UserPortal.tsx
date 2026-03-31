import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Server,
  CreditCard,
  Ticket as TicketIcon,
  Activity,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Wifi,
  WifiOff,
  Globe,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Send,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Languages,
  Bell,
  MoreVertical,
  Sparkles,
  Download,
  Link2,
  Smartphone,
  Crown,
  TrendingUp,
  Calendar,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { cn } from './lib/utils';
import { useAuthStore } from './store/auth';
import type { Node, Plan, Subscription, Ticket } from './types';

// --- Shared Components (reuse same design tokens as admin) ---

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div
    className={cn(
      'bg-card text-card-foreground border border-slate-200/60 dark:border-slate-800/50 rounded-xl overflow-hidden shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const Badge = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) => {
  const variants = {
    default: 'bg-tag-default-bg text-tag-default-text border-tag-default-border',
    success: 'bg-tag-success-bg text-tag-success-text border-tag-success-border',
    warning: 'bg-tag-warning-bg text-tag-warning-text border-tag-warning-border',
    danger: 'bg-tag-danger-bg text-tag-danger-text border-tag-danger-border',
    info: 'bg-tag-info-bg text-tag-info-text border-tag-info-border',
  };
  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center justify-center w-fit',
        variants[variant]
      )}
    >
      {children}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
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
          <div className="p-4 md:p-6 overflow-y-auto flex-1 custom-scrollbar bg-card">{children}</div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- API helper ---
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const buildApiUrl = (path: string) => `${apiBaseUrl}${path}`;

// --- Circular Progress ---
const CircularProgress = ({ percentage, size = 160, strokeWidth = 12, color = '#10b981' }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/50" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-tight text-foreground">{percentage}%</span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">已使用</span>
      </div>
    </div>
  );
};

// --- Copy Button ---
const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 hover:bg-muted rounded-xl text-sm font-semibold transition-all duration-300 group w-full"
    >
      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />}
      <span className="text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1 text-left">{label}</span>
    </button>
  );
};

// ========================================
// USER DASHBOARD VIEW
// ========================================
const UserDashboardView = ({
  subscriptions,
  nodes,
  plans,
  onRefresh,
  apiRequest,
}: {
  subscriptions: Subscription[];
  nodes: Node[];
  plans: Plan[];
  onRefresh: () => void;
  apiRequest?: (path: string, options?: RequestInit) => Promise<any>;
}) => {
  const activeSub = subscriptions.find((s) => s.status === 'Active');
  const usagePercent = activeSub ? Math.round((activeSub.used / activeSub.total) * 100) : 0;
  const onlineNodes = nodes.filter((n) => n.status === 'online').length;

  const progressColor = usagePercent > 80 ? '#ef4444' : usagePercent > 60 ? '#f59e0b' : '#10b981';

  // Calculate days remaining
  const daysRemaining = activeSub ? Math.max(0, Math.ceil((new Date(activeSub.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">我的面板</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">欢迎回来，查看您的订阅状态与流量概览</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-slate-200/60 dark:border-slate-800/50 rounded-xl text-sm font-semibold hover:bg-muted shadow-sm transition-all"
        >
          <RefreshCw size={16} />
          刷新
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-100/80 dark:bg-emerald-500/10">
              <Wifi size={22} className="text-emerald-600 dark:text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">在线节点</p>
              <p className="text-2xl font-black tracking-tight">{onlineNodes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-100/80 dark:bg-sky-500/10">
              <Globe size={22} className="text-sky-600 dark:text-sky-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">可用节点</p>
              <p className="text-2xl font-black tracking-tight">{nodes.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-violet-100/80 dark:bg-violet-500/10">
              <Calendar size={22} className="text-violet-600 dark:text-violet-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">剩余天数</p>
              <p className="text-2xl font-black tracking-tight">{daysRemaining}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-100/80 dark:bg-amber-500/10">
              <Smartphone size={22} className="text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">设备限制</p>
              <p className="text-2xl font-black tracking-tight">{activeSub ? plans.find((p) => p.name === activeSub.plan)?.devices ?? '-' : '-'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content: Traffic + Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Usage */}
        <Card className="lg:col-span-1 p-6 flex flex-col items-center">
          <h3 className="font-bold text-base mb-6 self-start flex items-center gap-2">
            <TrendingUp size={18} /> 流量使用
          </h3>
          <CircularProgress percentage={usagePercent} color={progressColor} />
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-foreground">
              {activeSub?.used ?? 0} GB / {activeSub?.total ?? 0} GB
            </p>
            <p className="text-xs text-muted-foreground mt-1">剩余 {(activeSub?.total ?? 0) - (activeSub?.used ?? 0)} GB 可用</p>
          </div>
          {usagePercent > 80 && (
            <div className="mt-4 px-4 py-2 bg-tag-danger-bg border border-tag-danger-border rounded-xl text-xs font-bold text-tag-danger-text text-center">
              ⚠️ 流量已使用超过 80%，建议及时续费
            </div>
          )}
        </Card>

        {/* Subscription Info + Quick Links */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-bold text-base mb-5 flex items-center gap-2">
            <CreditCard size={18} /> 订阅详情
          </h3>
          {activeSub ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">当前套餐</p>
                  <p className="font-bold text-foreground flex items-center gap-2">
                    <Crown size={16} className="text-amber-500" />
                    {activeSub.plan}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">到期日期</p>
                  <p className="font-bold text-foreground">{activeSub.expiry}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">快速订阅</p>
                <div className="space-y-2">
                  <CopyButton text={`${window.location.origin}/api/subscribe/clash?token=user-token`} label="Clash 订阅链接" />
                  <CopyButton text={`${window.location.origin}/api/subscribe/v2ray?token=user-token`} label="V2Ray 订阅链接" />
                  <CopyButton text={`${window.location.origin}/api/subscribe/quantumult?token=user-token`} label="QuantumultX 订阅链接" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md"
                >
                  <Download size={16} /> 下载配置文件
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-all"
                >
                  <Link2 size={16} /> 使用教程
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CreditCard size={48} className="mb-4 opacity-30" />
              <p className="font-bold">暂无活跃订阅</p>
              <p className="text-sm mt-1">前往套餐中心选购适合您的方案</p>
            </div>
          )}
        </Card>
      </div>

      {/* Announcements */}
      <Card className="p-6">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <Bell size={18} /> 系统公告
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-tag-info-bg border border-tag-info-border rounded-xl flex items-start gap-3">
            <Sparkles size={18} className="text-tag-info-text shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-tag-info-text">日本东京节点上线</p>
              <p className="text-xs text-tag-info-text/70 mt-1">新增东京 BGP 节点，支持 IPLC 专线加速，适合游戏用户使用。</p>
            </div>
          </div>
          <div className="p-4 bg-tag-warning-bg border border-tag-warning-border rounded-xl flex items-start gap-3">
            <Clock size={18} className="text-tag-warning-text shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-tag-warning-text">计划维护通知</p>
              <p className="text-xs text-tag-warning-text/70 mt-1">香港节点将于 4 月 5 日凌晨 2:00-4:00 进行线路维护，届时可能出现短暂中断。</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ========================================
// USER NODES VIEW
// ========================================
const UserNodesView = ({ nodes }: { nodes: Node[] }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'region' | 'latency' | 'status'>('status');

  const filtered = useMemo(() => {
    let result = nodes.filter(
      (n) =>
        n.host.toLowerCase().includes(search.toLowerCase()) ||
        n.region.toLowerCase().includes(search.toLowerCase()) ||
        n.protocol.toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => {
      if (sortBy === 'status') return (a.status === 'online' ? 0 : 1) - (b.status === 'online' ? 0 : 1);
      if (sortBy === 'latency') return (a.latency || 999) - (b.latency || 999);
      return a.region.localeCompare(b.region);
    });
    return result;
  }, [nodes, search, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">我的节点</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">查看可用节点状态与连接质量</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors" size={16} />
            <input
              type="text"
              placeholder="搜索节点..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-card border border-slate-200/60 dark:border-slate-800/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all w-full sm:w-64 shadow-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 bg-card border border-slate-200/60 dark:border-slate-800/50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
          >
            <option value="status">按状态</option>
            <option value="latency">按延迟</option>
            <option value="region">按地区</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((node) => (
          <Card key={node.id} className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-2.5 h-2.5 rounded-full shrink-0',
                    node.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-400'
                  )}
                />
                <div>
                  <p className="font-bold text-sm text-foreground">{node.host}</p>
                  <p className="text-xs text-muted-foreground">{node.region}</p>
                </div>
              </div>
              <Badge variant={node.status === 'online' ? 'success' : 'default'}>{node.status === 'online' ? '在线' : '离线'}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">协议</p>
                <p className="text-xs font-bold mt-0.5">{node.protocol}</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">延迟</p>
                <p className={cn('text-xs font-bold mt-0.5', node.latency < 100 ? 'text-emerald-600 dark:text-emerald-400' : node.latency < 200 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400')}>
                  {node.latency || '-'}ms
                </p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">丢包率</p>
                <p className="text-xs font-bold mt-0.5">{node.packetLoss}%</p>
              </div>
            </div>
            {node.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {node.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-muted/50 rounded-md text-[10px] font-bold text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center text-muted-foreground">
          <WifiOff size={48} className="mb-4 opacity-30" />
          <p className="font-bold">未找到节点</p>
        </Card>
      )}
    </div>
  );
};

// ========================================
// USER STORE VIEW
// ========================================
const UserStoreView = ({ plans, currentPlan }: { plans: Plan[]; currentPlan?: string }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-foreground">套餐中心</h2>
        <p className="text-sm text-muted-foreground mt-1 font-medium">选择适合您的流量方案，即时生效</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, idx) => {
          const isPopular = idx === 0;
          const isCurrent = plan.name === currentPlan;
          return (
            <Card
              key={plan.id}
              className={cn(
                'relative p-6 hover:shadow-lg hover:translate-y-[-4px] transition-all duration-500',
                isPopular && 'ring-2 ring-accent shadow-xl'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-accent text-accent-foreground rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                    推荐
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-4 right-4">
                  <Badge variant="success">当前</Badge>
                </div>
              )}
              <div className="text-center pt-2 pb-6 border-b border-border dark:border-slate-700/30">
                <h3 className="text-lg font-black text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-foreground">{plan.limit}</span>
                  <span className="text-sm font-bold text-muted-foreground">GB</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{plan.days} 天有效期</p>
              </div>
              <div className="space-y-3 py-6">
                <div className="flex items-center gap-3 text-sm">
                  <Zap size={16} className="text-emerald-500" />
                  <span className="text-foreground font-medium">{plan.limit} GB 高速流量</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Smartphone size={16} className="text-sky-500" />
                  <span className="text-foreground font-medium">最多 {plan.devices} 台设备同时在线</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield size={16} className="text-violet-500" />
                  <span className="text-foreground font-medium">全部节点可用</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Globe size={16} className="text-amber-500" />
                  <span className="text-foreground font-medium">支持全部地区</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isCurrent) return;
                  setSelectedPlan(plan);
                }}
                disabled={isCurrent}
                className={cn(
                  'w-full py-3 rounded-xl font-bold text-sm transition-all duration-300',
                  isCurrent
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : isPopular
                    ? 'bg-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/10'
                    : 'bg-muted hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {isCurrent ? '当前套餐' : '立即订购'}
              </button>
            </Card>
          );
        })}
      </div>

      {/* Purchase Confirmation Modal */}
      <Modal isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} title="确认订购">
        {selectedPlan && (
          <div className="space-y-5">
            <div className="p-5 bg-muted/30 rounded-xl text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">您正在订购</p>
              <h3 className="text-xl font-black mt-2">{selectedPlan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedPlan.limit} GB · {selectedPlan.days} 天 · {selectedPlan.devices} 设备
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-bold text-foreground">选择支付方式</p>
              {['支付宝', '微信支付', 'USDT'].map((method) => (
                <button
                  key={method}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border border-border rounded-xl hover:bg-muted/50 transition-all text-sm font-semibold text-foreground"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <CreditCard size={16} className="text-muted-foreground" />
                  </div>
                  {method}
                  <ArrowRight size={16} className="ml-auto text-muted-foreground" />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wider">
              支付后系统将自动为您激活套餐
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ========================================
// USER TICKETS VIEW
// ========================================
const UserTicketsView = ({
  tickets,
  apiRequest,
  onRefresh,
}: {
  tickets: Ticket[];
  apiRequest: (path: string, options?: RequestInit) => Promise<any>;
  onRefresh: () => void;
}) => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    try {
      await apiRequest(`/api/user/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ body: replyText }),
      });
      toast.success('回复已发送');
      setReplyText('');
      onRefresh();
    } catch {
      toast.error('回复失败');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/user/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject: newSubject, priority: newPriority, body: newBody }),
      });
      toast.success('工单已提交');
      setIsNewTicketOpen(false);
      setNewSubject('');
      setNewBody('');
      onRefresh();
    } catch {
      toast.error('提交失败');
    }
  };

  const priorityVariant = (p: string) => {
    if (p === 'Urgent') return 'danger';
    if (p === 'High') return 'warning';
    return 'default';
  };
  const statusVariant = (s: string) => {
    if (s === 'Resolved') return 'success';
    if (s === 'Pending') return 'warning';
    return 'info';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">我的工单</h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">查看工单状态或提交新的支持请求</p>
        </div>
        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-accent/10 transition-all"
        >
          <Plus size={16} /> 新建工单
        </button>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="p-5 hover:shadow-md cursor-pointer transition-all duration-300"
            onClick={() => setSelectedTicket(ticket)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-sm text-foreground truncate">{ticket.subject}</h4>
                  <Badge variant={priorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                  <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">创建于 {ticket.createdAt}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground shrink-0 ml-4" />
            </div>
          </Card>
        ))}
        {tickets.length === 0 && (
          <Card className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare size={48} className="mb-4 opacity-30" />
            <p className="font-bold">暂无工单</p>
            <p className="text-sm mt-1">遇到问题？点击上方新建工单按钮</p>
          </Card>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={selectedTicket?.subject ?? ''}>
        {selectedTicket && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant={priorityVariant(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
              <Badge variant={statusVariant(selectedTicket.status)}>{selectedTicket.status}</Badge>
            </div>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {(selectedTicket.messages ?? []).map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'p-4 rounded-xl text-sm',
                    msg.role === 'user' ? 'bg-accent/5 border border-accent/10 ml-4' : 'bg-muted/50 mr-4'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {msg.role === 'user' ? '我' : '客服'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-foreground">{msg.content}</p>
                </div>
              ))}
            </div>
            {selectedTicket.status !== 'Resolved' && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="输入回复内容..."
                  className="flex-1 px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                />
                <button
                  onClick={handleReply}
                  className="px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* New Ticket Modal */}
      <Modal isOpen={isNewTicketOpen} onClose={() => setIsNewTicketOpen(false)} title="新建工单">
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80">主题</label>
            <input
              required
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="简要描述您的问题"
              className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80">优先级</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <option value="low">低</option>
              <option value="medium">普通</option>
              <option value="high">高</option>
              <option value="critical">紧急</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground/80">详细描述</label>
            <textarea
              required
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="详细描述您遇到的问题..."
              rows={5}
              className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsNewTicketOpen(false)} className="flex-1 py-2.5 border border-border rounded-xl font-semibold hover:bg-muted transition-all">
              取消
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-accent text-accent-foreground rounded-xl font-bold hover:opacity-90 transition-all">
              提交工单
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// ========================================
// USER PORTAL (Main Layout)
// ========================================
export default function UserPortal() {
  const { i18n } = useTranslation();
  const { adminToken, logout, adminEmail, adminName } = useAuthStore();
  const [activeView, setActiveView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [nodes, setNodes] = useState<Node[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

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

  const fetchData = async () => {
    try {
      const [userNodesResp, plansResp, meResp, userTicketsResp] = await Promise.all([
        apiRequest('/api/user/nodes'),
        apiRequest('/api/plans'),
        apiRequest('/api/me'),
        apiRequest('/api/user/tickets'),
      ]);

      // User nodes endpoint returns array of node objects directly (with hostname, health, etc.)
      setNodes(
        (userNodesResp ?? []).map((node: any) => ({
          id: node.id,
          protocol: String(node.protocol ?? '').toUpperCase(),
          host: node.hostname,
          port: node.port,
          region: node.region,
          status: node.online ? 'online' : 'offline',
          active: Boolean(node.active),
          latency: node.health?.latencyMs ?? 0,
          packetLoss: Math.round((node.health?.packetLoss ?? 0) * 100),
          tags: (node.tags as string[]) ?? [],
        }))
      );

      // Plans endpoint returns array with nested schema
      setPlans(
        (plansResp ?? []).map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          limit: plan.limit ?? plan.bandwidthLimitGb,
          days: plan.days ?? plan.durationDays,
          devices: plan.devices ?? plan.concurrentDevices,
          rules: plan.rules ?? '',
        }))
      );

      // /api/me returns { user, subscriptions } where subscriptions includes plan
      const meSubs = meResp?.subscriptions ?? [];
      setSubscriptions(
        meSubs.map((sub: any) => ({
          id: sub.id,
          user: meResp?.user?.displayName || meResp?.user?.email || '-',
          plan: sub.plan?.name || sub.planId,
          status: sub.status === 'active' ? 'Active' : sub.status === 'expired' ? 'Expired' : 'Suspended',
          used: Math.round(sub.usageGb ?? 0),
          total: sub.plan?.bandwidthLimitGb ?? 0,
          expiry: new Date(sub.expiresAt).toLocaleDateString(),
        }))
      );

      // User tickets endpoint returns array directly with messages included
      setTickets(
        (userTicketsResp ?? []).map((ticket: any) => ({
          id: ticket.id,
          subject: ticket.subject,
          priority: ticket.priority === 'critical' ? 'Urgent' : ticket.priority === 'high' ? 'High' : ticket.priority === 'medium' ? 'Medium' : 'Low',
          status: ticket.status === 'open' ? 'Open' : ticket.status === 'pending' ? 'Pending' : 'Resolved',
          node: ticket.nodeId ?? '-',
          createdAt: new Date(ticket.createdAt).toLocaleString(),
          messages: (ticket.messages ?? []).map((msg: any) => ({
            id: msg.id,
            sender: msg.sender === 'admin' ? 'Support' : 'User',
            role: msg.sender === 'admin' ? 'support' : 'user',
            content: msg.body,
            timestamp: new Date(msg.createdAt).toLocaleString(),
          })),
        }))
      );
    } catch {
      toast.error('数据加载失败');
    }
  };

  useEffect(() => {
    if (!adminToken) return;
    fetchData();
  }, [adminToken]);

  useEffect(() => {
    const root = document.documentElement;
    darkMode ? root.classList.add('dark') : root.classList.remove('dark');
  }, [darkMode]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');
  };

  const navItems = [
    { id: 'dashboard', label: '我的面板', icon: LayoutDashboard },
    { id: 'nodes', label: '我的节点', icon: Server },
    { id: 'store', label: '套餐中心', icon: CreditCard },
    { id: 'tickets', label: '我的工单', icon: TicketIcon },
  ];

  const activeSub = subscriptions.find((s) => s.status === 'Active');

  return (
    <div className="flex h-screen bg-background font-sans text-foreground transition-colors duration-300 overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && window.innerWidth < 1024 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-mid-layer border-r border-border dark:border-none flex flex-col transition-all duration-300 z-50',
          'fixed inset-y-0 left-0 lg:relative lg:translate-x-0',
          sidebarOpen ? 'w-[250px] translate-x-0' : 'w-0 lg:w-[64px] -translate-x-full lg:translate-x-0'
        )}
      >
        <div className={cn('p-6 flex items-center gap-3 transition-all duration-300 overflow-hidden shrink-0', sidebarOpen ? 'justify-between' : 'justify-center px-0')}>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center transition-all duration-500 shrink-0 shadow-lg shadow-accent/20">
              <Activity className="text-accent-foreground" size={20} />
            </div>
            {sidebarOpen && (
              <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-black tracking-tight whitespace-nowrap text-foreground">
                NodeAdmin
              </motion.h1>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 lg:hidden hover:bg-muted rounded-lg transition-colors shrink-0">
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
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 group relative',
                activeView === item.id
                  ? 'bg-accent text-accent-foreground shadow-xl shadow-accent/10 translate-x-1'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-slate-800/50',
                !sidebarOpen && 'justify-center px-0 translate-x-0'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
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

        <div className={cn('p-4 border-t border-border dark:border-none mt-auto shrink-0 transition-all', !sidebarOpen && 'px-2')}>
          <div className={cn('flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors duration-300 overflow-hidden', !sidebarOpen && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold transition-colors duration-300 shrink-0">
              {(adminName || adminEmail || 'U').charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{adminName || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{adminEmail}</p>
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
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-muted rounded-lg transition-colors flex items-center justify-center" title={sidebarOpen ? '收起' : '展开'}>
              <Menu size={20} className="text-muted-foreground" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>用户中心</span>
              <ChevronRight size={14} />
              <span className="text-foreground font-medium">{navItems.find((n) => n.id === activeView)?.label ?? ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-4">
            <button onClick={toggleLanguage} className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300" title="Switch Language">
              <Languages size={20} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300" title="Toggle Dark Mode">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground relative transition-colors duration-300">
              <Bell size={20} />
            </button>
            <div className="hidden md:block h-8 w-[1px] bg-border transition-colors duration-300" />
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="success">已连接</Badge>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {activeView === 'dashboard' && (
                  <UserDashboardView subscriptions={subscriptions} nodes={nodes} plans={plans} onRefresh={fetchData} apiRequest={apiRequest} />
                )}
                {activeView === 'nodes' && <UserNodesView nodes={nodes} />}
                {activeView === 'store' && <UserStoreView plans={plans} currentPlan={activeSub?.plan} />}
                {activeView === 'tickets' && <UserTicketsView tickets={tickets} apiRequest={apiRequest} onRefresh={fetchData} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Toaster position="top-right" richColors theme={darkMode ? 'dark' : 'light'} />
    </div>
  );
}
