import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, ShieldAlert, Clock, ChevronRight } from 'lucide-react';
import { Card, Badge } from '../components/UI';
import type { Alert } from '../types';

interface AlertsViewProps {
  alerts: Alert[];
}

export const AlertsView = ({ alerts }: AlertsViewProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('alerts')}</h2>
        <Badge variant={alerts.length > 0 ? 'danger' : 'success'}>
          {alerts.length} Active System Events
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.map(alert => (
          <Card key={alert.id} className="p-4 border-l-4 border-l-rose-500">
             <div className="flex items-start justify-between">
                <div className="flex gap-4">
                   <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-500 shrink-0">
                      <ShieldAlert size={20} />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold">{alert.message}</h3>
                     <p className="text-xs text-zinc-500 mt-1 line-clamp-2">The system detected an anomaly on node {alert.id.slice(-8)}. Automatic mitigation is being applied.</p>
                     <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                           <Clock size={12} /> {new Date(alert.createdAt).toLocaleString()}
                        </span>
                        <Badge variant="danger" className="text-[8px]">{alert.severity}</Badge>
                     </div>
                   </div>
                </div>
                <button className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors">
                  <ChevronRight size={20} />
                </button>
             </div>
          </Card>
        ))}
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-emerald-50/20 dark:bg-emerald-500/5 rounded-3xl border-2 border-dashed border-emerald-500/20 text-center">
             <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-pulse">
                <Bell size={32} />
             </div>
             <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-500">System Secure</h3>
             <p className="text-sm text-zinc-500 mt-2 px-10">All nodes are operating within normal parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
