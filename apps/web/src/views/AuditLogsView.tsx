import React from 'react';
import { useTranslation } from 'react-i18next';
import { History, Search, Filter, Clock, Activity, Shield } from 'lucide-react';
import { Card, Badge } from '../components/UI';
import type { AuditLog } from '../types';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView = ({ logs }: AuditLogsViewProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('auditLogs')}</h2>
        <div className="flex gap-2 text-zinc-400">
           <History size={20} />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-border">
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Timestamp</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Actor</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Action</th>
                <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 whitespace-nowrap text-zinc-500 flex items-center gap-2">
                    <Clock size={12} />
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium">{log.userEmail}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      {log.action}
                    </div>
                  </td>
                  <td className="p-4">
                    <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      {log.metadata ? JSON.stringify(log.metadata).slice(0, 50) + '...' : 'N/A'}
                    </code>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-zinc-400 italic">No audit records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
