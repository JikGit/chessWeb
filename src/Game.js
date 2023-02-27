import React from 'react'
import Board from './Board'
import SingOut from './auth/SingOut'

function Game({userName}) {
  return (
    <div>
        <Board userName={userName}/>
        <SingOut/>
    </div>
  )
}

export default Game