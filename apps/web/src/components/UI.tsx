import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ArrowDownRight, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// --- Card ---
export const Card = ({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div className={cn("bg-card text-card-foreground border border-border rounded-xl overflow-hidden shadow-sm transition-colors duration-300", className)} {...props}>
    {children}
  </div>
);

// --- StatCard ---
export const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-card-foreground">{value}</h3>
          {trend !== undefined && (
            <div className={cn("flex items-center mt-2 text-xs font-medium", trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {trend > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg flex items-center justify-center shadow-lg", color)}>
          <Icon size={24} className="text-white dark:text-zinc-900" />
        </div>
      </div>
    </Card>
  );
};

// --- Badge ---
export const Badge = ({ children, variant = 'default', hierarchy = 'secondary', className, ...props }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'info', hierarchy?: 'primary' | 'secondary', className?: string, [key: string]: any }) => {
  const variants = {
    default: {
      primary: 'bg-zinc-600 text-white border-zinc-600 dark:bg-zinc-200 dark:text-zinc-900 shadow-sm',
      secondary: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
    },
    success: {
      primary: 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 shadow-sm',
      secondary: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20'
    },
    warning: {
      primary: 'bg-amber-500 text-amber-950 border-amber-500 dark:bg-amber-400 dark:text-amber-950 shadow-sm',
      secondary: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20'
    },
    danger: {
      primary: 'bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:text-rose-950 shadow-sm',
      secondary: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-500 dark:border-rose-500/20'
    },
    info: {
      primary: 'bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:text-sky-950 shadow-sm',
      secondary: 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-500/10 dark:text-sky-500 dark:border-sky-500/20'
    },
  };
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border flex items-center justify-center w-fit whitespace-nowrap",
      variants[variant][hierarchy],
      className
    )} {...props}>
      {children}
    </span>
  );
};

// --- Modal ---
export const Modal = ({ isOpen, onClose, title, children, className }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, className?: string }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn("relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]", className)}
          >
            <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <XCircle size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
