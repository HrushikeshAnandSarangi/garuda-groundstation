'use client'
import React, { useState, useEffect } from 'react';
// If you are using lucide-react, uncomment the imports.
// If not, the component will still work with the text fallbacks/SVGs provided below.
import { Battery, ArrowUp, Navigation, Zap, Globe, Wifi } from 'lucide-react';

interface DroneTelemetry {
  battery: number;
  altitude: number;
  speed: number;
  satellites: number;
  latitude: number;
  longitude: number;
  heading: number;
}

export default function Parameters2() {
  const [data, setData] = useState<DroneTelemetry>({
    battery: 85,
    altitude: 45.2,
    speed: 12.5,
    satellites: 14,
    latitude: 37.7749,
    longitude: -122.4194,
    heading: 180,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        battery: Math.max(0, prev.battery - 0.05),
        altitude: Math.max(0, prev.altitude + (Math.random() - 0.5)),
        speed: Math.max(0, 12 + (Math.random() * 2 - 1)),
        latitude: prev.latitude + (Math.random() * 0.0001 - 0.00005),
        longitude: prev.longitude + (Math.random() * 0.0001 - 0.00005),
        heading: (prev.heading + (Math.random() * 4 - 2)) % 360,
      }));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Determine battery color logic
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-400';
    if (level > 20) return 'text-yellow-400';
    return 'text-red-500';
  };

  return (
    // Container: pure black with a slight border for separation
    <div className="w-full max-w-md bg-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl font-mono">
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          {/* Simple Activity Icon */}
          <Zap className="w-5 h-5 text-yellow-500 fill-current" />
          <h3 className="text-xl font-bold text-white tracking-wide">TELEMETRY</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-800">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-400 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="flex flex-col">
        
        {/* Row 1: Battery (Highlighted) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/20">
          <div className="flex items-center gap-3 text-gray-400">
            <Battery className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Battery</span>
          </div>
          <div className={`flex items-center gap-3 ${getBatteryColor(data.battery)}`}>
            {/* Battery Progress Bar */}
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-current transition-all duration-500" 
                style={{ width: `${data.battery}%` }}
              />
            </div>
            <span className="text-xl font-bold">{data.battery.toFixed(0)}%</span>
          </div>
        </div>

        {/* Row 2: Altitude & Speed (Grid Layout for better use of space) */}
        <div className="grid grid-cols-2 border-b border-gray-800">
          {/* Altitude */}
          <div className="p-5 border-r border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <ArrowUp className="w-4 h-4" />
              <span className="text-xs uppercase">Altitude (AGL)</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {data.altitude.toFixed(1)} <span className="text-base text-gray-500 font-normal">m</span>
            </div>
          </div>
          
          {/* Speed */}
          <div className="p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Navigation className="w-4 h-4 rotate-90" />
              <span className="text-xs uppercase">Gnd Speed</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {data.speed.toFixed(1)} <span className="text-base text-gray-500 font-normal">m/s</span>
            </div>
          </div>
        </div>

        {/* Row 3: Heading & Sats */}
        <div className="grid grid-cols-2 border-b border-gray-800 bg-gray-900/20">
          <div className="p-5 border-r border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Navigation className="w-4 h-4" style={{ transform: `rotate(${data.heading}deg)` }} />
              <span className="text-xs uppercase">Heading</span>
            </div>
            <div className="text-xl font-bold text-white">
               {Math.abs(data.heading).toFixed(0)}°
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Wifi className="w-4 h-4" />
              <span className="text-xs uppercase">Satellites</span>
            </div>
            <div className="text-xl font-bold text-white">
              {data.satellites}
            </div>
          </div>
        </div>

        {/* Row 4: GPS */}
        <div className="px-6 py-4">
          <div className="flex items-start gap-3 text-gray-500 mb-2">
            <Globe className="w-4 h-4 mt-1" />
            <span className="text-xs uppercase mt-1">Global Position</span>
          </div>
          <div className="flex justify-between font-mono text-sm">
            <div className="bg-gray-900 px-3 py-2 rounded text-blue-300">
              <span className="text-gray-600 mr-2">LAT</span>{data.latitude.toFixed(6)}
            </div>
            <div className="bg-gray-900 px-3 py-2 rounded text-blue-300">
              <span className="text-gray-600 mr-2">LON</span>{data.longitude.toFixed(6)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}