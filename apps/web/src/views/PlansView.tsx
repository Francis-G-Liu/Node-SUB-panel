import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Edit2, Trash2, Zap, Clock, Shield, 
  Smartphone, Hash, Settings, Info
} from 'lucide-react';
import { Card, Badge, Modal } from '../components/UI';
import { cn } from '../lib/utils';
import type { Plan } from '../types';

interface PlansViewProps {
  plans: Plan[];
  onAction: (type: string, id: string | null, action: string, data?: any) => void;
}

export const PlansView = ({ plans, onAction }: PlansViewProps) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    limit: 100,
    days: 30,
    devices: 3,
    rules: 'Global'
  });

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
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      limit: plan.limit,
      days: plan.days,
      devices: plan.devices,
      rules: plan.rules
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold tracking-tight">{t('plans')}</h2>
           <p className="text-sm text-muted-foreground mt-1">Configure service quotas, validity and device limits</p>
        </div>
        <button 
           onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}
           className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent/20"
        >
          <Plus size={18} />
          {t('addPlan')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((p) => (
          <Card key={p.id} className="relative group overflow-visible">
            <div className="p-6">
               <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                     <Zap size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => handleEdit(p)} className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-all"><Edit2 size={16}/></button>
                     <button onClick={() => onAction('plans', p.id, 'delete')} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                  </div>
               </div>
               
               <h3 className="text-lg font-bold mb-1">{p.name}</h3>
               <p className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
                  <Settings size={12} />
                  {p.rules || 'Standard Routing'}
               </p>

               <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground flex items-center gap-2">
                        <Hash size={14} />
                        {t('trafficLimit')}
                     </span>
                     <span className="font-black text-accent">{p.limit} GB</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground flex items-center gap-2">
                        <Clock size={14} />
                        {t('validityDays')}
                     </span>
                     <span className="font-bold">{p.days} {t('days')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground flex items-center gap-2">
                        <Smartphone size={14} />
                        {t('deviceLimit')}
                     </span>
                     <Badge variant="info" hierarchy="secondary">{p.devices} Units</Badge>
                  </div>
               </div>
            </div>
            
            <div className="absolute -bottom-3 left-6">
               <Badge variant="success" hierarchy="primary">Active</Badge>
            </div>
          </Card>
        ))}
        {plans.length === 0 && (
          <div className="col-span-full py-20 bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
             <Info size={40} className="mb-2 opacity-20" />
             <p className="text-sm font-medium">No plans configured yet</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPlan ? t('editPlan') : t('addPlan')}>
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('name')}</label>
               <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" placeholder="Premium Monthly" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('trafficLimit')} (GB)</label>
                  <input required type="number" value={formData.limit} onChange={e => setFormData({...formData, limit: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('validityDays')}</label>
                  <input required type="number" value={formData.days} onChange={e => setFormData({...formData, days: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('deviceLimit')}</label>
                  <input required type="number" value={formData.devices} onChange={e => setFormData({...formData, devices: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Routing {t('rules')}</label>
                  <select value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium appearance-none">
                     <option value="Global">Global</option>
                     <option value="Rule-Based">Rule-Based</option>
                     <option value="HK-Direct">HK-Direct</option>
                  </select>
               </div>
            </div>
            <div className="flex gap-3 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-bold border border-border rounded-xl hover:bg-muted transition-all">{t('cancel')}</button>
                <button type="submit" className="flex-1 py-3 bg-accent text-accent-foreground rounded-xl text-sm font-black shadow-lg shadow-accent/20 hover:brightness-110 active:scale-95 transition-all">{t('save')}</button>
            </div>
         </form>
      </Modal>
    </div>
  );
};
