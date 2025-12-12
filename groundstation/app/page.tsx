
import CameraFeedback1 from '@/components/CameraFeedback1'
import CameraFeedback2 from '@/components/CameraFeedback2'
import React from 'react'

export default function page() {
  return (
    <div className=' grid-cols-2'>
      <div className=' flex w-screen'>
        <CameraFeedback1/>
        <CameraFeedback2/>
      </div>
      <div className=' flex '>
      </div>
    </div>
  )
}
