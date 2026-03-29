import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Network, Activity, CreditCard, Ticket as TicketIcon, 
  Server, ShieldAlert, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Card, StatCard, Badge } from '../components/UI';
import { cn } from '../lib/utils';

interface DashboardViewProps {
  stats: any;
  nodeStream: any[];
  alertStream: any[];
  onRefresh?: () => void;
}

export const DashboardView = ({ stats, nodeStream, alertStream, onRefresh }: DashboardViewProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-card-foreground">{t('dashboard')}</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time system health and connectivity overview</p>
        </div>
        <button 
          onClick={onRefresh}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all duration-300"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 flex flex-col h-[400px]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <Activity size={18} className="text-indigo-600" />
                Connectivity Trend
              </h3>
              <div className="flex gap-2">
                 <Badge variant="success" hierarchy="secondary">Stable</Badge>
              </div>
           </div>
           <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={nodeStream}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="load" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>

        <Card className="flex flex-col h-[400px]">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-500" />
              {t('systemAlerts')}
            </h3>
            <Badge variant="danger" hierarchy="primary">{t('live')}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs scrollbar-hide">
            {alertStream.map((log: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 transition-all hover:scale-[1.01]">
                <span className="text-muted-foreground/60">[{log.time}]</span>
                <span className="font-bold text-rose-700 dark:text-rose-400 truncate">{log.name}</span>
                <Badge variant={log.severity === 'Critical' ? 'danger' : 'warning'} hierarchy="secondary" className="ml-auto">{log.severity}</Badge>
              </div>
            ))}
            {alertStream.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic gap-2 opacity-50">
                <CheckCircle2 size={32} className="text-emerald-500" />
                {t('noAlerts') || 'No active alerts'}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="flex flex-col h-[400px]">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Server size={18} className="text-emerald-500" />
              {t('nodeActivity')}
            </h3>
            <Badge variant="info" hierarchy="primary">{t('live')}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3 scrollbar-hide">
            {nodeStream.map((log: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border transition-all hover:bg-muted/50">
                <span className="text-muted-foreground/60 font-medium">[{log.time}]</span>
                <span className="font-bold truncate max-w-[120px]">{log.node || 'Edge-Core'}</span>
                <Badge 
                   variant={log.action === 'Online' || (log.load !== undefined && log.load < 80) ? 'success' : 'danger'} 
                   hierarchy="secondary"
                   className="ml-auto"
                >
                  {log.action === 'Online' ? t('online') : (log.load !== undefined ? `${log.load}% Load` : t('offline'))}
                </Badge>
              </div>
            ))}
            {nodeStream.length === 0 && <div className="col-span-2 text-center text-muted-foreground italic py-10">{t('waitingEvents')}</div>}
          </div>
        </Card>
    </div>
  );
};

const CheckCircle2 = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);
