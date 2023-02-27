import React from 'react'
import NuovaPartita from './NuovaPartita'

function Sconfitta() {
  return (
    <div className='fineGame sconfitta center'>
        <NuovaPartita/>
        <div className="circle center">
            <h1>Sconfitta</h1>
            <p>Check Mate</p>
        </div>
    </div>
  )
}

export default Sconfitta