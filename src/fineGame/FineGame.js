import React from 'react'
import NuovaPartita from './NuovaPartita'
import { useRef } from 'react';

function FineGame({fineGame}){
  const windowFineGame = useRef();

  return (
    <>
      <div id="fineGame" className={`${fineGame} center`}>
          <NuovaPartita/>
          <div className="circle center">
              <h1>{fineGame}</h1>
              <p>Check Mate</p>
          </div>
      </div>
    </>
  )
}

export default FineGame; 