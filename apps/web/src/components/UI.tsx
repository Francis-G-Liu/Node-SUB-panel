import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ArrowDownRight, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// --- Brand Logo ---
export const BrandLogo = ({ size = 36, className = '', showBadge = false }: { size?: number; className?: string; showBadge?: boolean }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className="shrink-0">
      <defs>
        <linearGradient id="brandGradShared" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#brandGradShared)" />
      <circle cx="12" cy="12" r="2.5" fill="white" />
      <circle cx="24" cy="12" r="2.5" fill="white" />
      <circle cx="12" cy="24" r="2.5" fill="white" />
      <circle cx="24" cy="24" r="2.5" fill="white" />
      <line x1="14.5" y1="12" x2="21.5" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="14.5" x2="12" y2="21.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="14.5" x2="24" y2="21.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14.5" y1="24" x2="21.5" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="14" x2="22" y2="22" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
    {showBadge && (
      <span className="brand-gradient text-[10px] font-black px-1.5 py-0.5 rounded text-white tracking-widest leading-none">PRO</span>
    )}
  </div>
);

// --- Card ---
export const Card = ({ children, className, ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div 
    className={cn(
      "bg-card text-card-foreground border border-slate-200/60 dark:border-slate-800/50 rounded-xl overflow-hidden shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300", 
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

// --- StatCard ---
export const StatCard = ({ title, value, icon: Icon, trend, color, iconColor }: any) => {
  return (
    <Card className="p-4 sm:p-6 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-black tracking-tight">{value}</h3>
          {trend !== undefined && (
            <div className={cn("flex items-center mt-2 text-xs font-bold", trend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
              {trend > 0 ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
              {Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}
            </div>
          )}
        </div>
        <div className={cn("p-4 rounded-2xl transition-all duration-300 shadow-sm shadow-black/5", color)}>
          <Icon size={26} className={iconColor} />
        </div>
      </div>
    </Card>
  );
};

// --- Badge ---
export const Badge = ({ children, variant = 'default', hierarchy = 'secondary', className, ...props }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'info', hierarchy?: 'primary' | 'secondary', className?: string, [key: string]: any }) => {
  const variants = {
    default: {
      primary: 'bg-tag-default-text text-white border-tag-default-text dark:bg-tag-default-text dark:text-tag-default-bg shadow-sm',
      secondary: 'bg-tag-default-bg text-tag-default-text border-tag-default-border'
    },
    success: {
      primary: 'bg-tag-success-text text-white border-tag-success-text dark:bg-tag-success-text dark:text-tag-success-bg shadow-sm',
      secondary: 'bg-tag-success-bg text-tag-success-text border-tag-success-border'
    },
    warning: {
      primary: 'bg-tag-warning-text text-white border-tag-warning-text dark:bg-tag-warning-text dark:text-tag-warning-bg shadow-sm',
      secondary: 'bg-tag-warning-bg text-tag-warning-text border-tag-warning-border'
    },
    danger: {
      primary: 'bg-tag-danger-text text-white border-tag-danger-text dark:bg-tag-danger-text dark:text-tag-danger-bg shadow-sm',
      secondary: 'bg-tag-danger-bg text-tag-danger-text border-tag-danger-border'
    },
    info: {
      primary: 'bg-tag-info-text text-white border-tag-info-text dark:bg-tag-info-text dark:text-tag-info-bg shadow-sm',
      secondary: 'bg-tag-info-bg text-tag-info-text border-tag-info-border'
    },
  };
  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border flex items-center justify-center w-fit whitespace-nowrap leading-none",
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
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[85%] md:max-w-lg lg:max-w-2xl bg-card border border-border dark:border-slate-700/30 rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] z-[51] flex flex-col max-h-[90vh] overflow-hidden", 
              className
            )}
          >
            <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between shrink-0 bg-muted/20">
              <h3 className="font-bold text-lg tracking-tight">{title}</h3>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-muted rounded-xl transition-all hover:rotate-90 duration-300"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
