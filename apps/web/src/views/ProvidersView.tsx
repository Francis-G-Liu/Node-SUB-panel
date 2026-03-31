import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Search, RefreshCw, Edit, Trash2, FileUp, 
  ExternalLink, Globe, Tag, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Badge, Modal } from '../components/UI';
import { cn } from '../lib/utils';
import { extractProviderYamlFields } from '../lib/safe-yaml';
import type { Provider } from '../types';

interface ProvidersViewProps {
  providers: Provider[];
  onAction: (type: string, id: string | null, action: string, data?: any) => void;
}

export const ProvidersView = ({ providers, onAction }: ProvidersViewProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [yamlFile, setYamlFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    subscriptionUrl: '',
    regionHint: 'Global',
    syncIntervalMinutes: 60,
    tags: '',
    yamlContent: ''
  });

  const filteredProviders = useMemo(() => providers.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.subscriptionUrl.toLowerCase().includes(search.toLowerCase()) ||
    p.regionHint.toLowerCase().includes(search.toLowerCase())
  ), [providers, search]);

  useEffect(() => {
    if (editingProvider) {
      setFormData({
        name: editingProvider.name,
        subscriptionUrl: editingProvider.subscriptionUrl,
        regionHint: editingProvider.regionHint,
        syncIntervalMinutes: editingProvider.syncIntervalMinutes,
        tags: editingProvider.tags.join(', '),
        yamlContent: editingProvider.yamlContent || ''
      });
    } else {
      setFormData({ name: '', subscriptionUrl: '', regionHint: 'Global', syncIntervalMinutes: 60, tags: '', yamlContent: '' });
      setYamlFile(null);
    }
  }, [editingProvider]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setYamlFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        try {
          const parsed = extractProviderYamlFields(content);
          setFormData(prev => ({ 
            ...prev, 
            name: parsed.name ?? prev.name,
            subscriptionUrl: parsed.subscriptionUrl ?? prev.subscriptionUrl,
            regionHint: parsed.regionHint ?? prev.regionHint,
            syncIntervalMinutes: parsed.syncIntervalMinutes ?? prev.syncIntervalMinutes,
            tags: parsed.tags ?? prev.tags,
            yamlContent: content 
          }));
          toast.success('YAML parsed successfully');
        } catch {
          setFormData(prev => ({ ...prev, yamlContent: content }));
          toast.success('File loaded as text');
        }
      };
      reader.readAsText(file);
    }
  };

  const parseYamlContent = () => {
    if (!formData.yamlContent) return;
    try {
      const parsed = extractProviderYamlFields(formData.yamlContent);
      setFormData(prev => ({
        ...prev,
        name: parsed.name ?? prev.name,
        subscriptionUrl: parsed.subscriptionUrl ?? prev.subscriptionUrl,
        regionHint: parsed.regionHint ?? prev.regionHint,
        syncIntervalMinutes: parsed.syncIntervalMinutes ?? prev.syncIntervalMinutes,
        tags: parsed.tags ?? prev.tags
      }));
      toast.success(t('parsed') || 'Parsed successfully');
    } catch {
      toast.error(t('invalidYaml') || 'Invalid YAML content');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t !== '');
    const payload = { 
      name: formData.name,
      subscriptionUrl: formData.subscriptionUrl,
      regionHint: formData.regionHint,
      syncIntervalMinutes: formData.syncIntervalMinutes,
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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold tracking-tight">{t('providers')}</h2>
           <p className="text-sm text-muted-foreground mt-1">Manage external edge nodes subscription sources</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => { setEditingProvider(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-accent/20"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('addProvider')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="overflow-x-auto scrollbar-hide">
             <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('name')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('url')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('region')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('syncInterval')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('lastSync')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProviders.map((p) => (
                    <tr key={p.id} className="group hover:bg-muted/40 transition-all duration-200">
                      <td className="px-6 py-5">
                         <div className="flex flex-col">
                            <span className="font-bold text-sm">{p.name}</span>
                            <div className="flex gap-1 mt-1">
                               {p.tags.map(tag => <Badge key={tag} hierarchy="secondary">{tag}</Badge>)}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2 max-w-[200px]">
                            <ExternalLink size={14} className="text-muted-foreground shrink-0" />
                            <span className="text-[10px] font-mono text-muted-foreground truncate" title={p.subscriptionUrl}>{p.subscriptionUrl}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            <Globe size={14} className="text-muted-foreground" />
                            <span className="text-sm font-medium">{p.regionHint}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                             <Clock size={14} className="text-muted-foreground" />
                             <span className="text-sm font-medium">{p.syncIntervalMinutes}m</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                         <span className="text-xs text-muted-foreground">{p.lastSyncAt ? new Date(p.lastSyncAt).toLocaleString() : 'Never'}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onAction('providers', p.id, 'sync')} className="p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-all" title={t('sync')}><RefreshCw size={16}/></button>
                          <button onClick={() => { setEditingProvider(p); setIsModalOpen(true); }} className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-all" title={t('edit')}><Edit size={16}/></button>
                          <button onClick={() => onAction('providers', p.id, 'delete')} className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all" title={t('delete')}><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProviders.length === 0 && (
                    <tr>
                       <td colSpan={6} className="py-20 text-center text-muted-foreground italic">No providers found</td>
                    </tr>
                  )}
                </tbody>
             </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProvider ? t('editProvider') : t('addProvider')}>
         <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('name')}</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" placeholder="My Provider" />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('region')}</label>
                  <input type="text" value={formData.regionHint} onChange={e => setFormData({...formData, regionHint: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" placeholder="Global / US / JP" />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('url')}</label>
               <input required type="url" value={formData.subscriptionUrl} onChange={e => setFormData({...formData, subscriptionUrl: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium font-mono" placeholder="https://api.provider.com/sub" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('syncInterval')} ({t('minutes')})</label>
                  <input required type="number" min="1" value={formData.syncIntervalMinutes} onChange={e => setFormData({...formData, syncIntervalMinutes: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('tags')}</label>
                  <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all text-sm font-medium" placeholder="vip, high-speed" />
               </div>
            </div>

            <div className="pt-2">
               <label className="inline-flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest pl-1 mb-2">
                  <FileUp size={14} />
                  {t('importYaml') || 'Advanced Import (YAML)'}
               </label>
               <div className="relative">
                  <input type="file" accept=".yaml,.yml" onChange={handleFileChange} className="hidden" id="yaml-upload" />
                  <label htmlFor="yaml-upload" className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-muted/20 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-muted/40 hover:border-accent/40 transition-all group">
                     <FileUp size={24} className="text-muted-foreground group-hover:text-accent transition-all" />
                     <div className="text-center">
                        <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-all">
                           {yamlFile ? yamlFile.name : (t('selectFile') || 'Click to upload YAML configuration')}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-widest font-bold">Standard NodeAdmin YAML Format</p>
                     </div>
                  </label>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">{t('yamlContent')}</label>
                  <button type="button" onClick={parseYamlContent} className="px-2 py-1 bg-accent/10 text-accent rounded-md text-[10px] font-black uppercase tracking-tighter hover:bg-accent/20 transition-all">
                     {t('parse') || 'Smart Parse'}
                  </button>
               </div>
               <textarea
                  value={formData.yamlContent}
                  onChange={e => setFormData({...formData, yamlContent: e.target.value})}
                  placeholder="Paste YAML content here to auto-fill..."
                  className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-accent transition-all h-32 font-mono text-xs scrollbar-hide"
               />
            </div>

            <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-bold border border-border rounded-xl hover:bg-muted transition-all">{t('cancel')}</button>
                <button type="submit" className="flex-1 py-3 bg-accent text-accent-foreground rounded-xl text-sm font-black shadow-lg shadow-accent/20 hover:brightness-110 active:scale-95 transition-all">{t('save')}</button>
            </div>
         </form>
      </Modal>
    </div>
  );
};
