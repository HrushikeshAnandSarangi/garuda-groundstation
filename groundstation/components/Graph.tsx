'use client'
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Activity, Zap, TrendingUp, Pause, Play, Download } from 'lucide-react';

// --- Types ---
type MetricType = 'altitude' | 'velocity' | 'battery';

interface DataPoint {
  time: string;
  drone1: number;
  drone2: number;
}

export default function Graph() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('altitude');
  const [isPaused, setIsPaused] = useState(false);

  // --- FALSE DATA GENERATOR ---
  // This useEffect simulates a WebSocket connection by generating fake data every 1 second
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      // Format time as HH:mm:ss
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

      setData((prevData) => {
        // Get the last data point to make the next point "smooth" (random walk)
        // If no data exists, use these starting values:
        const lastPt = prevData[prevData.length - 1] || { drone1: 50, drone2: 40 };
        
        let d1, d2;

        // Generate different fake physics based on the selected metric
        switch (selectedMetric) {
          case 'altitude': // (Meters) Smooth drift
            // Drone 1 drifts, Drone 2 is more erratic
            d1 = Math.max(0, lastPt.drone1 + (Math.random() - 0.5) * 5); 
            d2 = Math.max(0, lastPt.drone2 + (Math.random() - 0.5) * 7);
            break;

          case 'velocity': // (m/s) Noisy fluctuation around cruise speed
            // Drone 1 cruises at ~15m/s, Drone 2 at ~18m/s
            d1 = 15 + (Math.random() * 4 - 2);
            d2 = 18 + (Math.random() * 6 - 3);
            break;

          case 'battery': // (%) Linear drain
            // Drone 1 is efficient, Drone 2 drains faster
            d1 = Math.max(0, (prevData.length === 0 ? 100 : lastPt.drone1) - 0.05);
            d2 = Math.max(0, (prevData.length === 0 ? 98 : lastPt.drone2) - 0.1);
            break;
        }

        const newPoint: DataPoint = {
          time: timeStr,
          drone1: parseFloat(d1.toFixed(2)),
          drone2: parseFloat(d2.toFixed(2)),
        };

        // Sliding Window: Keep only the last 20 points so the graph doesn't get crowded
        const newData = [...prevData, newPoint];
        if (newData.length > 20) newData.shift();
        
        return newData;
      });
    }, 1000); // Update frequency: 1 second

    return () => clearInterval(interval);
  }, [isPaused, selectedMetric]);

  // Reset graph data if the user switches metrics (optional UX choice)
  useEffect(() => {
    setData([]);
  }, [selectedMetric]);

  // --- Helpers for UI ---
  const getUnit = () => {
    switch (selectedMetric) {
      case 'altitude': return 'm';
      case 'velocity': return 'm/s';
      case 'battery': return '%';
    }
  };

  return (
    <div className="w-full h-full bg-black text-white p-6 rounded-3xl border border-gray-800 shadow-2xl flex flex-col font-mono select-none">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-lg border border-gray-800">
             <Activity className="text-blue-500 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Live Analysis</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
               <h1 className="text-xl font-black tracking-tight text-white">DUAL-LINK TELEMETRY</h1>
            </div>
          </div>
        </div>

        {/* Controls Group */}
        <div className="flex items-center gap-3 bg-gray-900/50 p-1.5 rounded-xl border border-gray-800">
          
          {/* Metric Toggle Buttons */}
          <div className="flex space-x-1">
            <button 
              onClick={() => setSelectedMetric('altitude')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 
              ${selectedMetric === 'altitude' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            >
              <TrendingUp className="w-3 h-3" /> Alt
            </button>
            <button 
              onClick={() => setSelectedMetric('velocity')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 
              ${selectedMetric === 'velocity' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            >
              <Activity className="w-3 h-3" /> Vel
            </button>
            <button 
              onClick={() => setSelectedMetric('battery')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 
              ${selectedMetric === 'battery' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            >
              <Zap className="w-3 h-3" /> Bat
            </button>
          </div>

          <div className="w-px h-6 bg-gray-700 mx-1"></div>

          {/* Pause Button */}
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-lg transition-colors ${isPaused ? 'bg-yellow-500 text-black' : 'hover:bg-gray-800 text-gray-400'}`}
            title={isPaused ? "Resume Live Feed" : "Pause Live Feed"}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </div>

      {/* 2. Graph Container */}
      <div className="flex-1 w-full min-h-[350px] bg-gray-900/20 rounded-2xl p-4 border border-gray-800/50 relative">
        {/* Background Grid Accent (Optional) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              stroke="#555" 
              tick={{fill: '#666', fontSize: 10, fontWeight: 'bold'}} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            
            <YAxis 
              stroke="#555" 
              tick={{fill: '#666', fontSize: 10, fontWeight: 'bold'}} 
              tickLine={false}
              axisLine={false}
              unit={` ${getUnit()}`}
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #333', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '4px' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
              cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
            />
            
            {/* Drone 1 Line (Blue/Cyan) */}
            <Line 
              name="Drone Alpha"
              type="monotone" 
              dataKey="drone1" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={300}
              isAnimationActive={false} // Disable for smoother real-time feel
            />

            {/* Drone 2 Line (Purple) */}
            <Line 
              name="Drone Bravo"
              type="monotone" 
              dataKey="drone2" 
              stroke="#a855f7" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={300}
              isAnimationActive={false}
            />

            {/* Gradient Definitions (Advanced Recharts usage) */}
            <defs>
              <linearGradient id="colorDrone1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}