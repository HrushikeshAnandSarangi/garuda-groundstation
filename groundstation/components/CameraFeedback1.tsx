'use client'

import React, { useEffect, useRef, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

type StreamStatus = 'connecting' | 'connected' | 'disconnected'

export default function CameraFeedback1() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [status, setStatus] = useState<StreamStatus>('connecting')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const WIDTH = 1280
    const HEIGHT = 720

    canvas.width = WIDTH
    canvas.height = HEIGHT

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.createImageData(WIDTH, HEIGHT)

    let lastFrameTs = Date.now()

    // start FFmpeg stream from Rust
    invoke('start_video_drone').catch(console.error)

    // listen for raw video frames
    const unlisten = listen<Uint8Array>('video-frame', (event) => {
      const frame = new Uint8ClampedArray(event.payload)

      if (frame.length !== WIDTH * HEIGHT * 4) return

      imageData.data.set(frame)
      ctx.putImageData(imageData, 0, 0)

      lastFrameTs = Date.now()
      setStatus('connected')
    })

    // connection watchdog
    const watchdog = setInterval(() => {
      if (Date.now() - lastFrameTs > 2000) {
        setStatus('disconnected')
      }
    }, 500)

    return () => {
      unlisten.then(f => f())
      clearInterval(watchdog)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h3 className="mb-2 text-lg font-semibold">DRONE 1</h3>

      <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden shadow-lg text-white p-3">
        {/* VIDEO CANVAS */}
        <canvas
          ref={canvasRef}
          className="w-full rounded bg-black"
        />

        {/* STATUS BAR */}
        <div className="mt-2 flex justify-between text-sm">
          <span>
            Stream:{' '}
            <strong
              className={
                status === 'connected'
                  ? 'text-green-400'
                  : status === 'connecting'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }
            >
              {status}
            </strong>
          </span>

          {status === 'connected' && (
            <span className="text-red-500 font-bold">● LIVE</span>
          )}
        </div>
      </div>
    </div>
  )
}
