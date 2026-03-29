import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, Trash2, Edit2, Tag, Shield, User as UserIcon } from 'lucide-react';
import { Card, Badge } from '../components/UI';
import { cn } from '../lib/utils';
import type { User, UserCategory } from '../types';

interface UsersViewProps {
  users: User[];
  categories: UserCategory[];
  onOpenModal: (type: string, mode: string, data?: any) => void;
  onAction: (type: string, id: string | null, action: string, data?: any) => void;
}

export const UsersView = ({ users, categories, onOpenModal, onAction }: UsersViewProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.nickname && u.nickname.toLowerCase().includes(search.toLowerCase()))
  ), [users, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold tracking-tight">{t('users')}</h2>
           <p className="text-sm text-muted-foreground mt-1">Manage platform administrators and end-user accounts</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder={t('searchUser')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => onOpenModal('users', 'create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent/20"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('addUser')}</span>
          </button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('user')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('category')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('role')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(u => (
                <tr key={u.id} className="group hover:bg-muted/40 transition-all duration-200">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-sm border border-accent/20">
                        {u.email[0].toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{u.nickname || u.email.split('@')[0]}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Tag size={14} className="text-muted-foreground" />
                       <span className="text-sm font-medium">{u.category?.name || 'Uncategorized'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge 
                       variant={u.role.includes('admin') ? 'danger' : u.role === 'user' ? 'default' : 'warning'} 
                       hierarchy="secondary"
                       className="font-black"
                    >
                       <Shield size={10} className="mr-1" />
                       {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onOpenModal('users', 'update', u)} className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-all" title={t('edit')}><Edit2 size={16}/></button>
                      <button onClick={() => onAction('users', u.id, 'delete')} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all" title={t('delete')}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                   <td colSpan={4} className="py-20 text-center text-muted-foreground italic">No users found matching your search</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
