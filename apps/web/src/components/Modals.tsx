import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import type { User, UserCategory } from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const UserModal = ({ isOpen, onClose, user, categories, onSave }: any) => {
  const [formData, setFormData] = useState(user || { email: '', nickname: '', role: 'USER', password: '', categoryId: '' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Create User'}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); onClose(); }} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase">Email Address</label>
          <input 
            type="email" 
            required 
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg" 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase">Nickname</label>
          <input 
            type="text" 
            value={formData.nickname}
            onChange={e => setFormData({ ...formData, nickname: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Category</label>
            <select 
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg"
            >
              <option value="">Default/None</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">System Role</label>
            <select 
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg"
            >
              <option value="USER">USER</option>
              <option value="OPS">OPS</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>
        {!user && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
            <input 
              type="password" 
              required={!user}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg" 
            />
          </div>
        )}
        <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all mt-6">
          <Save size={18} />
          Save Changes
        </button>
      </form>
    </Modal>
  );
};

export const CategoryModal = ({ isOpen, onClose, category, onSave }: any) => {
  const [formData, setFormData] = useState(category || { name: '', baseRole: 'USER' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit Category' : 'New Category'}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); onClose(); }} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase">Category Name</label>
          <input 
            type="text" 
            required 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg" 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase">Base Role Mapping</label>
          <select 
            value={formData.baseRole}
            onChange={e => setFormData({ ...formData, baseRole: e.target.value })}
            className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg"
          >
            <option value="USER">USER</option>
            <option value="OPS">OPS</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <p className="text-[10px] text-zinc-400 italic">Users assigned to this category will automatically inherit this base role.</p>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold transition-all mt-6">
          <Save size={18} />
          Save Category
        </button>
      </form>
    </Modal>
  );
};

export const PlanModal = ({ isOpen, onClose, plan, onSave }: any) => {
  const [formData, setFormData] = useState(plan || { name: '', bandwidthLimitGb: 100, durationDays: 30, concurrentDevices: 3, regionFilters: [] });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={plan ? '编辑套餐' : '新建套餐'}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); onClose(); }} className="space-y-4">
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-zinc-500 uppercase">套餐名称</label>
           <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">流量 (GB)</label>
              <input type="number" required value={formData.bandwidthLimitGb} onChange={e => setFormData({...formData, bandwidthLimitGb: Number(e.target.value)})} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg" />
           </div>
           <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">有效天数</label>
              <input type="number" required value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg" />
           </div>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold mt-4">确认保存</button>
      </form>
    </Modal>
  );
};

export const SubscriptionModal = ({ isOpen, onClose, subscription, plans, users, onSave }: any) => {
  const [formData, setFormData] = useState(subscription || { userId: '', planId: '', status: 'ACTIVE' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={subscription ? '编辑订阅' : '分配订阅'}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); onClose(); }} className="space-y-4">
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-zinc-500 uppercase">目标用户</label>
           <select required value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg">
             <option value="">请选择用户</option>
             {users.map((u: any) => (<option key={u.id} value={u.id}>{u.email}</option>))}
           </select>
        </div>
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-zinc-500 uppercase">选择套餐</label>
           <select required value={formData.planId} onChange={e => setFormData({...formData, planId: e.target.value})} className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-border rounded-lg">
             <option value="">请选择套餐</option>
             {plans.map((p: any) => (<option key={p.id} value={p.id}>{p.name}</option>))}
           </select>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold mt-4">确认分配</button>
      </form>
    </Modal>
  );
};
