'use client'
import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface CameraFeedbackProps {
  // URL of the live stream (usually ends in .m3u8)
  // I've included a public test stream as a default
  streamUrl?: string; 
}

export default function CameraFeedback2({ 
  streamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' 
}: CameraFeedbackProps) {
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Check if the browser supports Media Source Extensions (Chrome, Firefox, Edge)
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false, // Set to true to see streaming logs in console
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.error("Auto-play blocked:", e));
      });

      // Cleanup: Destroy the HLS instance when component unmounts
      return () => {
        hls.destroy();
      };
    } 
    // 2. Fallback for native HLS support (Safari usually supports this directly)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(e => console.error("Auto-play blocked:", e));
      });
    }
  }, [streamUrl]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h3 className="mb-2 text-lg font-semibold">DRONE 2</h3>
      <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          controls
          muted // Muted is often required for autoplay to work in modern browsers
          playsInline
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        {/* Optional: Add an overlay or recording indicator here */}
        <div style={{ position: 'absolute', top: 10, right: 10, color: 'red', fontWeight: 'bold' }}>
          ● LIVE
        </div>
      </div>
    </div>
  );
}