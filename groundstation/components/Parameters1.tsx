'use client';

import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

import { Battery, ArrowUp, Navigation, Zap, Globe, Wifi } from 'lucide-react';

interface DroneTelemetry {
  battery?: number;
  altitude?: number;
  speed?: number;
  satellites?: number;
  latitude?: number;
  longitude?: number;
  heading?: number;
  pitch?:number;
  roll?:number;
}

export default function Parameters1() {
  const [data, setData] = useState<DroneTelemetry>({});

  /* ---------------- SAFE FORMATTER ---------------- */
  const safe = (v?: number, digits = 1) =>
    typeof v === 'number' && !Number.isNaN(v) ? v.toFixed(digits) : '--';

  /* ---------------- UDP LISTENER ---------------- */
  useEffect(() => {
    invoke('start_udp_listener', { port: 14550 });

    const unlistenPromise = listen<DroneTelemetry>('telemetry', (event) => {
      setData(event.payload);
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  /* ---------------- BATTERY COLOR ---------------- */
  const getBatteryColor = (level?: number) => {
    if (typeof level !== 'number') return 'text-gray-500';
    if (level > 50) return 'text-green-400';
    if (level > 20) return 'text-yellow-400';
    return 'text-red-500';
  };

  return (
    <div className="w-full max-w-md bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl font-mono">

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500 fill-current" />
          <h3 className="text-xl font-bold text-white tracking-wide">
            TELEMETRY
          </h3>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-800">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-400 tracking-wider">
            LIVE
          </span>
        </div>
      </div>

      {/* Main Data */}
      <div className="flex flex-col">

        {/* Battery */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/20">
          <div className="flex items-center gap-3 text-gray-400">
            <Battery className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">
              Battery
            </span>
          </div>

          <div className={`flex items-center gap-3 ${getBatteryColor(data.battery)}`}>
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-current transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, data.battery ?? 0))}%`
                }}
              />
            </div>
            <span className="text-xl font-bold">
              {safe(data.battery, 0)}%
            </span>
          </div>
        </div>

        {/* Altitude & Speed */}
        <div className="grid grid-cols-2 border-b border-gray-800">
          <div className="p-5 border-r border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <ArrowUp className="w-4 h-4" />
              <span className="text-xs uppercase">Altitude (AGL)</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {safe(data.altitude, 1)}
              <span className="text-base text-gray-500 font-normal"> m</span>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Navigation className="w-4 h-4 rotate-90" />
              <span className="text-xs uppercase">Gnd Speed</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {safe(data.speed, 1)}
              <span className="text-base text-gray-500 font-normal"> m/s</span>
            </div>
          </div>
        </div>

        {/* Heading & Satellites */}
        <div className="grid grid-cols-2 border-b border-gray-800 bg-gray-900/20">
          <div className="p-5 border-r border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Navigation
                className="w-4 h-4"
                style={{ transform: `rotate(${data.heading ?? 0}deg)` }}
              />
              <span className="text-xs uppercase">Heading</span>
            </div>
            <div className="text-xl font-bold text-white">
              {safe(Math.abs(data.heading ?? 0), 0)}°
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Wifi className="w-4 h-4" />
              <span className="text-xs uppercase">Satellites</span>
            </div>
            <div className="text-xl font-bold text-white">
              {data.satellites ?? '--'}
            </div>
          </div>
        </div>

        {/* GPS */}
        <div className="px-6 py-4">
          <div className="flex items-start gap-3 text-gray-500 mb-2">
            <Globe className="w-4 h-4 mt-1" />
            <span className="text-xs uppercase mt-1">
              Global Position
            </span>
          </div>

          <div className="flex justify-between font-mono text-sm">

            {/* <div className="bg-gray-900 px-3 py-2 rounded text-blue-300">
              <span className="text-gray-600 mr-2">ROLL</span>
              {safe(data.roll, 6)}
            </div>
            <div className="bg-gray-900 px-3 py-2 rounded text-blue-300">
              <span className="text-gray-600 mr-2">PITCH</span>
              {safe(data.pitch, 6)}
            </div> */}
            <div className="bg-gray-900 px-3 py-2 rounded text-blue-300">
              <span className="text-gray-600 mr-2">LAT</span>
              {safe(data.latitude, 6)}
            </div>
            <div className="bg-gray-900 px-3 py-2 rounded text-blue-300">
              <span className="text-gray-600 mr-2">LAN</span>
              {safe(data.longitude, 6)}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
