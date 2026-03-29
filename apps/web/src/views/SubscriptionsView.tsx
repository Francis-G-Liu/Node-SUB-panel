import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, Clock, CheckCircle2, AlertCircle, 
  Trash2, RefreshCw, Smartphone, Hash, Calendar
} from 'lucide-react';
import { Card, Badge } from '../components/UI';
import { cn } from '../lib/utils';
import type { Subscription } from '../types';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  onAction: (type: string, id: string | null, action: string, data?: any) => void;
}

export const SubscriptionsView = ({ subscriptions, onAction }: SubscriptionsViewProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold tracking-tight">{t('subscriptions')}</h2>
           <p className="text-sm text-muted-foreground mt-1">Monitor active user subscriptions and traffic usage</p>
        </div>
        <button 
           onClick={() => onAction('subscriptions', null, 'refresh')}
           className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-all duration-300"
        >
          <RefreshCw size={16} />
          {t('refresh')}
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('user')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('plan')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Usage / Progress</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('expiry')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.map((s) => {
                const percent = Math.min(Math.round((s.used / s.total) * 100), 100);
                const isNearLimit = percent > 85;

                return (
                  <tr key={s.id} className="group hover:bg-muted/40 transition-all duration-200">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black text-xs">
                            {s.user.charAt(0).toUpperCase()}
                         </div>
                         <span className="font-bold text-sm">{s.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-muted-foreground" />
                          <span className="text-sm font-medium">{s.plan}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <Badge 
                         variant={s.status === 'Active' ? 'success' : s.status === 'Expired' ? 'danger' : 'warning'} 
                         hierarchy="secondary"
                      >
                         {s.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col gap-2 min-w-[140px]">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                             <span className={isNearLimit ? "text-rose-500" : "text-muted-foreground"}>{s.used} GB / {s.total} GB</span>
                             <span className={isNearLimit ? "text-rose-500" : "text-accent"}>{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                             <div 
                                className={cn(
                                   "h-full transition-all duration-1000",
                                   isNearLimit ? "bg-rose-500" : "bg-accent"
                                )} 
                                style={{ width: `${percent}%` }} 
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-muted-foreground" />
                          <span className="text-xs font-medium">{s.expiry}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onAction('subscriptions', s.id, 'delete')} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all" title={t('delete')}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {subscriptions.length === 0 && (
                <tr>
                   <td colSpan={6} className="py-20 text-center text-muted-foreground italic">No subscriptions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
