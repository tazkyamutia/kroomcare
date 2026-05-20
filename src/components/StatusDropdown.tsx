import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: 'Open' | 'In Progress' | 'Resolved') => void;
  className?: string;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({ 
  currentStatus, 
  onStatusChange,
  className 
}) => {
  const statuses: ('Open' | 'In Progress' | 'Resolved')[] = ['Open', 'In Progress', 'Resolved'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-blue-700 bg-blue-100';
      case 'In Progress': return 'text-amber-700 bg-amber-100';
      case 'Resolved': return 'text-emerald-700 bg-emerald-100';
      default: return 'text-slate-700 bg-slate-100';
    }
  };

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value as any)}
        className={cn(
          "appearance-none px-3 py-1.5 pr-8 rounded-full text-[10px] font-bold uppercase cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all border-none",
          getStatusColor(currentStatus)
        )}
      >
        {statuses.map((status) => (
          <option key={status} value={status} className="bg-white text-slate-900 normal-case font-medium">
            {status}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        <ChevronDown size={12} className={cn(
          currentStatus === 'Open' ? "text-blue-700" : 
          currentStatus === 'In Progress' ? "text-amber-700" : 
          "text-emerald-700"
        )} />
      </div>
    </div>
  );
};
