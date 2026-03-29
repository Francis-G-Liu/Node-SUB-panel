import React from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket as TicketIcon, Search, Clock, CheckCircle2, MoreVertical, MessageSquare } from 'lucide-react';
import { Card, Badge } from '../components/UI';
import type { Ticket } from '../types';

interface TicketsViewProps {
  tickets: Ticket[];
}

export const TicketsView = ({ tickets }: TicketsViewProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('tickets')}</h2>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input type="text" placeholder="Search tickets..." className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm" />
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {tickets.map(ticket => (
          <Card key={ticket.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                     <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{ticket.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500 font-medium">#{ticket.id.slice(-6).toUpperCase()}</span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-[10px] text-zinc-500">{ticket.user?.email}</span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant={ticket.status === 'Open' ? 'warning' : 'success'}>
                      {ticket.status}
                    </Badge>
                    <p className="text-[10px] text-zinc-400 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <MoreVertical size={18} />
                  </button>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
