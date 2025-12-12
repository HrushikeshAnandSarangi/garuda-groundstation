'use client'
import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Video, 
  Cpu, 
  Save, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';

// --- Types ---
interface SettingsState {
  units: 'metric' | 'imperial';
  theme: 'dark' | 'light';
  rthAltitude: number;
  maxAltitude: number;
  maxDistance: number;
  videoQuality: '720p' | '1080p' | '4K';
  osdEnabled: boolean;
  gridEnabled: boolean;
  pidP: number;
  pidI: number;
  pidD: number;
}

export default function SettingsPage() {
  // --- State ---
  const [settings, setSettings] = useState<SettingsState>({
    units: 'metric',
    theme: 'dark',
    rthAltitude: 30,
    maxAltitude: 120,
    maxDistance: 500,
    videoQuality: '1080p',
    osdEnabled: true,
    gridEnabled: false,
    pidP: 1.2,
    pidI: 0.05,
    pidD: 0.3,
  });

  const [openSection, setOpenSection] = useState<string | null>('safety');

  // --- Handlers ---
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const updateSetting = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Logic to save to backend/local storage
    alert("Settings Saved Successfully!");
  };

  // --- Render Helpers ---
  const SectionHeader = ({ id, title, icon: Icon }: { id: string, title: string, icon: any }) => (
    <button 
      onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-800 hover:bg-gray-800 transition-colors ${openSection === id ? 'text-blue-400' : 'text-gray-300'}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <span className="font-bold tracking-wide uppercase text-sm">{title}</span>
      </div>
      {openSection === id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="w-full max-w-2xl mx-auto h-full bg-black text-white rounded-xl shadow-2xl border border-gray-800 flex flex-col font-sans select-none overflow-hidden">
      
      {/* 1. HEADER */}
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/30 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Settings className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">SYSTEM CONFIG</h1>
            <p className="text-xs text-gray-500 font-mono">FW: v4.2.0-stable</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setSettings({ ...settings, rthAltitude: 30, pidP: 1.2, pidI: 0.05 })} 
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" 
            title="Reset Defaults"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-blue-900/20"
          >
            <Save className="w-4 h-4" /> SAVE
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* --- SECTION: GENERAL --- */}
        <div className="border-b border-gray-800">
          <SectionHeader id="general" title="General & Display" icon={Settings} />
          
          {openSection === 'general' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/50 animate-in slide-in-from-top-2 duration-200">
              
              {/* Unit System */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Unit System</label>
                <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
                  {['metric', 'imperial'].map((u) => (
                    <button
                      key={u}
                      onClick={() => updateSetting('units', u)}
                      className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${settings.units === u ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme (Simulated) */}
              <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-gray-500 uppercase">Interface Theme</label>
                 <button 
                   onClick={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                   className="flex items-center justify-between px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg"
                 >
                   <span className="text-sm font-bold capitalize">{settings.theme} Mode</span>
                   {settings.theme === 'dark' ? <ToggleRight className="w-6 h-6 text-blue-500" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                 </button>
              </div>

            </div>
          )}
        </div>

        {/* --- SECTION: SAFETY --- */}
        <div className="border-b border-gray-800">
          <SectionHeader id="safety" title="Flight Safety Limits" icon={Shield} />
          
          {openSection === 'safety' && (
            <div className="p-6 space-y-6 bg-black/50 animate-in slide-in-from-top-2 duration-200">
              
              {/* RTH Altitude */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase">Return to Home Altitude</label>
                  <span className="text-xs font-mono text-blue-400">{settings.rthAltitude}m</span>
                </div>
                <input 
                  type="range" min="10" max="100" step="1"
                  value={settings.rthAltitude}
                  onChange={(e) => updateSetting('rthAltitude', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Max Altitude */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase">Max Flight Altitude (Geofence)</label>
                  <span className="text-xs font-mono text-blue-400">{settings.maxAltitude}m</span>
                </div>
                <input 
                  type="range" min="20" max="500" step="10"
                  value={settings.maxAltitude}
                  onChange={(e) => updateSetting('maxAltitude', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Max Distance */}
               <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-gray-400 uppercase">Max Flight Distance</label>
                  <span className="text-xs font-mono text-blue-400">{settings.maxDistance}m</span>
                </div>
                <input 
                  type="range" min="100" max="2000" step="50"
                  value={settings.maxDistance}
                  onChange={(e) => updateSetting('maxDistance', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

            </div>
          )}
        </div>

        {/* --- SECTION: VIDEO --- */}
        <div className="border-b border-gray-800">
          <SectionHeader id="video" title="Video Transmission" icon={Video} />
          
          {openSection === 'video' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/50 animate-in slide-in-from-top-2 duration-200">
               
               {/* Video Quality */}
               <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-gray-500 uppercase">Stream Quality</label>
                 <select 
                   value={settings.videoQuality}
                   onChange={(e) => updateSetting('videoQuality', e.target.value)}
                   className="w-full bg-gray-900 text-white text-sm font-bold border border-gray-800 rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
                 >
                   <option value="720p">720p (Low Latency)</option>
                   <option value="1080p">1080p HD</option>
                   <option value="4K">4K UHD (High Bandwidth)</option>
                 </select>
               </div>

               {/* OSD Toggle */}
               <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800">
                  <span className="text-sm font-bold text-gray-300">Enable OSD Overlay</span>
                  <button onClick={() => updateSetting('osdEnabled', !settings.osdEnabled)}>
                    {settings.osdEnabled ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-gray-500" />}
                  </button>
               </div>

            </div>
          )}
        </div>

        {/* --- SECTION: PID TUNING --- */}
        <div>
          <SectionHeader id="pid" title="PID Tuning (Advanced)" icon={Cpu} />
          
          {openSection === 'pid' && (
            <div className="p-6 grid grid-cols-3 gap-4 bg-black/50 animate-in slide-in-from-top-2 duration-200">
              
              {['P', 'I', 'D'].map((param) => (
                <div key={param} className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-center text-gray-500">GAIN {param}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={settings[`pid${param}` as keyof SettingsState] as number}
                    onChange={(e) => updateSetting(`pid${param}` as keyof SettingsState, parseFloat(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 text-white text-center font-mono rounded p-2 focus:border-purple-500 outline-none"
                  />
                </div>
              ))}

              <div className="col-span-3 mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-500 text-center">
                ⚠ Changing PID values in-flight may cause instability.
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}