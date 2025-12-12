
import CameraFeedback1 from '@/components/CameraFeedback1'
import CameraFeedback2 from '@/components/CameraFeedback2'
import Controller1 from '@/components/Controller1'
import Controller2 from '@/components/Controller2'
import Graph from '@/components/Graph'
import Parameters1 from '@/components/Parameters1'
import Parameters2 from '@/components/Parameters2'
import { SidebarContent } from '@/components/ui/sidebar'
import { Sidebar } from 'lucide-react'
import React from 'react'

export default function page() {
  return (
    <section className=' h-[80vh] w-full overflow-hidden bg-black'>
    
    <div className=' grid-cols-2'>
      <div className=' flex h-[40h] w-full overflow-hidden'>
        <div className=' h-[40vh] w-[20vw] grid-rows-2'>
          <CameraFeedback1/><Controller1/>
          </div>
        <div className='h-[40vh] w-[20vw] grid-rows-2'>
          <CameraFeedback2/>
          <Controller2/>

          </div>
        <Parameters1/>
        <Parameters2/>
      </div>
      <div className=' flex h-[40vh] '>
        <Graph/>
      </div>
    </div>
    </section>
  )
}
