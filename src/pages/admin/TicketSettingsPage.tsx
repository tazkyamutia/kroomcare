import React from 'react';
import { Settings, Ticket, Search, Filter, AlertCircle } from 'lucide-react';
import { DUMMY_TICKETS } from '../../utils/dummyData';
import { cn } from '../../lib/utils';

export const TicketSettingsPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Ticket Settings</h1>
          <p className="text-slate-500 mt-1">Konfigurasi prioritas dan pantau semua tiket sistem.</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold">Global Ticket View</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari tiket..." 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">ID Tiket</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Subjek</th>
                <th className="px-6 py-4">Prioritas</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DUMMY_TICKETS.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-brand-600">{ticket.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{ticket.customerName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{ticket.subject}</td>
                  <td className="px-6 py-4">
                    <select 
                      defaultValue={ticket.priority}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-lg focus:outline-none border-none",
                        ticket.priority === 'High' ? "bg-red-100 text-red-700" : 
                        ticket.priority === 'Medium' ? "bg-amber-100 text-amber-700" : 
                        "bg-slate-100 text-slate-700"
                      )}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      defaultValue={ticket.status}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-lg focus:outline-none border-none transition-colors",
                        ticket.status === 'Open' ? "bg-blue-100 text-blue-700" : 
                        ticket.status === 'In Progress' ? "bg-amber-100 text-amber-700" : 
                        ticket.status === 'Resolved' ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-700"
                      )}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
