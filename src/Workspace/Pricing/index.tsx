import { PricingTable } from '@clerk/clerk-react'
import React from 'react'

function Pricing() {
  return (
    <div className='flex justify-center items-center min-h-[80vh]' > 
    <div className='text-center max-w-4xl w-full px-4'>
        <h2 className='font-bold text-3xl mb-2'>Pricing</h2>
      <h2 className='text-gray-600 mb-8'>Start Creating unlimites PPT sliders</h2>
      <div className='flex justify-center'>
        <PricingTable />
      </div>
    </div> 
    </div>
  )
}

export default Pricing