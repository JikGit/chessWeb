import React from 'react'
import NuovaPartita from './NuovaPartita'

function Vittoria() {
  return (
    <div className='fineGame vittoria center'>
        <NuovaPartita/>
        <div className="circle center">
            <h1>Vittoria</h1>
            <p>Check Mate</p>
        </div>
    </div>
  )
}

export default Vittoria