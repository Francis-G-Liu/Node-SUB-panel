import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, Trash2, Edit2, Tag, Shield, Database } from 'lucide-react';
import { Card, Badge } from '../components/UI';
import { cn } from '../lib/utils';
import type { UserCategory } from '../types';

interface CategoriesViewProps {
  categories: UserCategory[];
  onOpenModal: (type: string, mode: string, data?: any) => void;
  onAction: (type: string, id: string | null, action: string, data?: any) => void;
}

export const CategoriesView = ({ categories, onOpenModal, onAction }: CategoriesViewProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold tracking-tight">{t('userCategories') || 'User Categories'}</h2>
           <p className="text-sm text-muted-foreground mt-1">Define security boundaries and permission templates</p>
        </div>
        <button 
           onClick={() => onOpenModal('categories', 'create')}
           className="flex items-center gap-2 px-6 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent/20"
        >
          <Plus size={18} />
          {t('addCategory') || 'Add Category'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <Card key={c.id} className="relative group overflow-visible">
            <div className="p-6">
               <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl transition-all shadow-lg", c.isSystem ? "bg-amber-500 text-white" : "bg-indigo-600 text-white")}>
                     {c.isSystem ? <Shield size={24} /> : <Tag size={24} />}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => onOpenModal('categories', 'update', c)} className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-all"><Edit2 size={16}/></button>
                     {!c.isSystem && (
                        <button onClick={() => onAction('categories', c.id, 'delete')} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                     )}
                  </div>
               </div>
               
               <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold">{c.name}</h3>
                  {c.isSystem && <Badge variant="warning" hierarchy="primary" className="text-[8px] px-1.5">System</Badge>}
               </div>
               
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-6 flex items-center gap-1">
                  <Database size={12} />
                  Base Role: {c.baseRole}
               </p>

               <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                           <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {i}
                           </div>
                        ))}
                     </div>
                     <span className="text-[10px] font-bold text-muted-foreground ml-1">Member Entities</span>
                  </div>
                  <Badge variant="info" hierarchy="secondary">Template</Badge>
               </div>
            </div>
          </Card>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-20 bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
             <Tag size={40} className="mb-2 opacity-20" />
             <p className="text-sm font-medium">No user categories defined</p>
          </div>
        )}
      </div>
    </div>
  );
};
