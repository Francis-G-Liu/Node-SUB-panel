import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Search, Filter, Server, Latency, Globe, Shield, 
  MoreVertical, Edit2, Trash2, Zap, RefreshCw 
} from 'lucide-react';
import { Card, Badge, Modal } from '../components/UI';
import { cn } from '../lib/utils';
import type { Node } from '../types';

interface NodesViewProps {
  nodes: Node[];
  onAction: (type: string, id: string | null, action: string, data?: any) => void;
}

export const NodesView = ({ nodes, onAction }: NodesViewProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    protocol: 'VMess',
    host: '',
    port: 443,
    region: 'Global',
    tags: ''
  });

  const filteredNodes = useMemo(() => nodes.filter(n => 
    n.host.toLowerCase().includes(search.toLowerCase()) ||
    (n.name && n.name.toLowerCase().includes(search.toLowerCase()))
  ), [nodes, search]);

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
    setFormData({ name: '', protocol: 'VMess', host: '', port: 443, region: 'Global', tags: '' });
  };

  const handleEdit = (node: Node) => {
    setEditingNode(node);
    setFormData({
      name: node.name || '',
      protocol: node.protocol,
      host: node.host,
      port: node.port,
      region: node.region,
      tags: node.tags.join(', ')
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold tracking-tight">{t('nodes')}</h2>
           <p className="text-sm text-muted-foreground mt-1">Manage global edge nodes and edge protocols</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder={t('searchNodes')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 w-full sm:w-64"
            />
          </div>
          <button 
             onClick={() => { setEditingNode(null); setIsModalOpen(true); }}
             className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent/20"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('addNode')}</span>
          </button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('name')} / {t('host')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('protocol')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('region')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Load / Latency</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredNodes.map((n) => (
                <tr key={n.id} className="group hover:bg-muted/40 transition-all duration-200">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{n.name || n.host}</span>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{n.host}:{n.port}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge variant="info" hierarchy="secondary" className="font-black">{n.protocol}</Badge>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Globe size={14} className="text-muted-foreground" />
                       <span className="text-sm font-medium">{n.region}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex flex-col gap-1.5">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                           <div className={cn("h-full transition-all duration-1000", n.status === 'Online' ? "bg-emerald-500" : "bg-rose-500")} style={{ width: n.status === 'Online' ? '65%' : '0%' }} />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">24ms / 32%</span>
                     </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={n.status === 'Online' ? 'success' : 'danger'} hierarchy="secondary">
                       <span className="flex items-center gap-1">
                          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", n.status === 'Online' ? "bg-emerald-500" : "bg-rose-500")} />
                          {n.status === 'Online' ? t('online') : t('offline')}
                       </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onAction('nodes', n.id, 'sync')} className="p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-all"><RefreshCw size={16}/></button>
                      <button onClick={() => handleEdit(n)} className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-all"><Edit2 size={16}/></button>
                      <button onClick={() => onAction('nodes', n.id, 'delete')} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredNodes.length === 0 && (
                 <tr>
                    <td colSpan={6} className="py-20 text-center text-muted-foreground italic">No nodes found matching your search</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingNode ? t('editNode') : t('addNode')}>
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('name')}</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" placeholder="My Node 01" />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('protocol')}</label>
                  <select value={formData.protocol} onChange={e => setFormData({...formData, protocol: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium appearance-none">
                     <option value="VMess">VMess</option>
                     <option value="VLESS">VLESS</option>
                     <option value="Trojan">Trojan</option>
                     <option value="Shadowsocks">Shadowsocks</option>
                     <option value="Hysteria2">Hysteria2</option>
                  </select>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
               <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('host')}</label>
                  <input required type="text" value={formData.host} onChange={e => setFormData({...formData, host: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium font-mono" placeholder="node1.server.com" />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('port')}</label>
                  <input required type="number" value={formData.port} onChange={e => setFormData({...formData, port: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('region')}</label>
               <input type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" placeholder="San Francisco, US" />
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('tags')}</label>
               <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" placeholder="vip, high-speed, gaming" />
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
