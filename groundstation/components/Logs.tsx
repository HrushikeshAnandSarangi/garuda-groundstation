'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Filter, 
  Pause, 
  Play, 
  Trash2, 
  Download, 
  AlertTriangle, 
  Info, 
  XCircle, 
  CheckCircle2 
} from 'lucide-react'

// --- Types ---
type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
}

// --- Mock Data Generator (For Simulation) ---
const MODULES = ['TELEMETRY', 'GPS', 'BATTERY', 'VIDEO_FEED', 'MOTOR_DRIVER'];
const MESSAGES = [
  { level: 'INFO', text: 'Heartbeat received from drone.' },
  { level: 'INFO', text: 'Packet processed successfully.' },
  { level: 'WARN', text: 'High latency detected in video stream.' },
  { level: 'WARN', text: 'GPS signal strength fluctuating.' },
  { level: 'ERROR', text: 'Connection lost with Motor 3.' },
  { level: 'ERROR', text: 'Checksum mismatch in telemetry packet.' },
  { level: 'SUCCESS', text: 'Reconnection attempt successful.' },
];

const generateLog = (): LogEntry => {
  const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    level: randomMsg.level as LogLevel,
    module: MODULES[Math.floor(Math.random() * MODULES.length)],
    message: randomMsg.text,
  };
};

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Real-time Simulation Effect ---
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newLog = generateLog();
      setLogs((prev) => [...prev.slice(-99), newLog]); // Keep last 100 logs
    }, 1500); // New log every 1.5 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  // --- Filtering Logic ---
  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === 'ALL' || log.level === filter;
    const matchesSearch = 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // --- Helper: Get Color by Level ---
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case 'INFO': return 'text-blue-400';
      case 'WARN': return 'text-yellow-400';
      case 'ERROR': return 'text-red-500';
      case 'SUCCESS': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'INFO': return <Info size={14} />;
      case 'WARN': return <AlertTriangle size={14} />;
      case 'ERROR': return <XCircle size={14} />;
      case 'SUCCESS': return <CheckCircle2 size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-200 font-mono rounded-lg border border-slate-800 shadow-xl overflow-hidden">
      
      {/* --- Header Controls --- */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
           System Logs
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1.5 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-md pl-8 pr-3 py-1 text-sm focus:outline-none focus:border-blue-500 w-48 transition-all"
            />
          </div>

          {/* Filter Dropdown (Simulated) */}
          <div className="flex bg-slate-900 rounded-md border border-slate-700 p-1">
            {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-3 py-1 text-xs rounded ${filter === lvl ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Actions Bar --- */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/30 text-xs border-b border-slate-800">
        <div className="flex gap-4">
          <span className="text-slate-500">Total: {logs.length}</span>
          <span className="text-slate-500">Showing: {filteredLogs.length}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1 hover:text-blue-400 transition-colors"
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button 
            onClick={() => setLogs([])}
            className="flex items-center gap-1 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} /> Clear
          </button>
          <button className="flex items-center gap-1 hover:text-green-400 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* --- Logs Container --- */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <Filter size={48} className="mb-2 opacity-20" />
            <p>No logs found matching criteria</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="group flex items-start gap-3 hover:bg-slate-900/60 p-1 rounded transition-colors text-sm border-l-2 border-transparent hover:border-slate-700"
            >
              <span className="text-slate-500 min-w-[85px] select-none">{log.timestamp}</span>
              
              <span className={`flex items-center gap-1 min-w-[80px] font-bold ${getLevelColor(log.level)}`}>
                {getLevelIcon(log.level)}
                {log.level}
              </span>
              
              <span className="text-purple-400 min-w-[120px] hidden sm:block">
                [{log.module}]
              </span>
              
              <span className="text-slate-300 break-all">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}