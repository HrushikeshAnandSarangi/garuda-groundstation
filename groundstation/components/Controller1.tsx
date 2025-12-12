'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Home, Signal, Shield, ShieldAlert, Zap, Map, Navigation } from 'lucide-react';

export type FlightModeType = 'LOITER' | 'STABILIZE' | 'ALT_HOLD' | 'RTL' | 'LAND' | 'GUIDED';

export default function Controller1() {
  // --- State Logic ---
  const [flightMode, setFlightMode] = useState<FlightModeType>('LOITER');
  const [isArmed, setIsArmed] = useState<boolean>(true);
  const [linkQuality, setLinkQuality] = useState<number>(100);
  const [missionName, setMissionName] = useState<string>('Patrol_Sector_4');
  const [systemStatus, setSystemStatus] = useState<string>('IN AIR');

  // Simulate Telemetry Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLinkQuality(p => Math.min(100, Math.max(0, p + (Math.random() * 5 - 2))));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle RTL Interaction
  const triggerRTL = useCallback(() => {
    if (flightMode !== 'RTL') {
      setFlightMode('RTL');
      setSystemStatus('RETURNING');
      setMissionName('RTL_EMERGENCY');
    }
  }, [flightMode]);

  const isRTL = flightMode === 'RTL';

  // --- Render ---
  return (
    <div className="w-[20vw] h-[20vh]  text-white rounded-2xl flex flex-col justify-between p-3   font-sans select-none overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] rounded-full opacity-20 pointer-events-none transition-colors duration-500
        ${isRTL ? 'bg-yellow-500' : 'bg-blue-600'}`} 
      />

      {/* 1. TOP BAR: Critical Stats */}
      <div className="flex justify-between items-start z-10">
        {/* Connection */}
        <div className="flex items-center gap-1.5 bg-gray-900/50 px-2 py-1 rounded-lg backdrop-blur-md">
           <Signal className={`w-3 h-3 ${linkQuality > 50 ? 'text-green-400' : 'text-red-500'}`} />
           <span className="text-[0.65rem] font-bold text-gray-300 tracking-wider">{linkQuality}%</span>
        </div>

        {/* Arming/Status */}
        <div className="flex items-center gap-1.5">
           <span className="text-[0.6rem] font-bold text-gray-500 uppercase">{systemStatus}</span>
           {isArmed 
             ? <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" /> 
             : <Shield className="w-4 h-4 text-green-500" />
           }
        </div>
      </div>

      {/* 2. MIDDLE: Flight Mode & Mission */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 -mt-1">
         {/* Icon */}
         <div className="mb-1">
            {isRTL 
              ? <Home className="w-8 h-8 text-yellow-400 animate-bounce" /> 
              : <Navigation className="w-8 h-8 text-blue-400" />
            }
         </div>
         
         {/* Mode Text */}
         <h1 className={`text-2xl font-black uppercase tracking-tight leading-none transition-colors duration-300
           ${isRTL ? 'text-yellow-400' : 'text-white'}`}>
           {flightMode}
         </h1>

         {/* Mission Pill */}
         <div className="mt-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800/80 border border-gray-700">
            <Map className="w-3 h-3 text-gray-400" />
            <span className="text-[0.6rem] font-mono text-gray-300 max-w-[12vw] truncate">
              {missionName}
            </span>
         </div>
      </div>

      {/* 3. BOTTOM: Interactive RTL Button */}
      <button
        onClick={triggerRTL}
        disabled={isRTL}
        className={`
          w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 z-10 shadow-lg group
          ${isRTL 
            ? 'bg-yellow-500/10 border border-yellow-500/30 cursor-not-allowed' 
            : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 hover:scale-[1.02] active:scale-95'
          }
        `}
      >
        {isRTL ? (
          <>
            <Home className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-500 tracking-wider">RETURNING HOME</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 text-white group-hover:fill-current" />
            <span className="text-xs font-black text-white tracking-widest">EMERGENCY RTL</span>
          </>
        )}
      </button>

    </div>
  );
}