import './css/arrows.css'
import './css/switchBoard.css';
import './css/fineGame.css';
import './css/menuSelectable.css';
import './css/game.css'

import React from 'react'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faAngleLeft, faArrowsRotate } from '@fortawesome/free-solid-svg-icons'

import Board from './Board'
import SingOut from './auth/SingOut'
import MenuSelectable from './MenuSelectable'
import  FineGame from './fineGame/FineGame';
import { readCollection } from './firebase/firebaseFunctions'
import { initialateGame } from './initialate/initialateGame';

function Game({userName}) {
	//id del game (preso dall'url)
	const idMatch = useLocation().pathname.split("/")[2]
	const [statoPartita, setStatoPartita] = useState("");
	const [winnerName, setWinnerName] = useState("");
	const [playerColor, setPlayerColor] = useState();
	const [spectator, setSpectator] = useState("");
	const [leftArrowClicked, setLeftArrowClicked] = useState(false);
	const [rightArrowClicked, setRightArrowClicked] = useState(false);

	const themes = ["tema 1", "tema 2", "tema 3", "tema 4"]
	//callback quando si clicka un item nel menu
	function optionMenuClicked(event){
		let themeElm = event.target;
		localStorage.setItem("piecesTheme", `${themeElm.innerHTML.split("tema ")[1]}`)
		window.location.reload();
	}	

	//se modifico lo stato della partita vedo come e' finita e metto lo schermo della vittoria/sconfitta/draw/stalemate
	useEffect(() => {
		if (statoPartita === "") return;
		//trovo il nome di quello che ha vinto
		if (statoPartita === "vittoria")
			setWinnerName(userName);
		else
			readCollection(`matches/${idMatch}/infoGame`).then(names => 
				setWinnerName((names[0].data.playerName !== userName ? names[0] : names[1]).data.playerName)
			)
	}, [statoPartita])

	//vedo se la partita e' gia' stata iniziata, imposto il player e trovo il suo colore, se gia' pieno allora e' spectator (puo' solo guardare)
	useEffect(() => {
		//crea gli utenti e ritorna il colore del player, e se e' uno spectator o no
		initialateGame(idMatch, userName).then(({boardColor, spectator}) => {
			setPlayerColor(boardColor);
			setSpectator(spectator);
		});
	}, [])

	return (
		<>
			{/*barra per selezione tema*/}
			<MenuSelectable items={themes} callbackFunction={optionMenuClicked}/>
			{/*Winner window*/}
			{winnerName && <FineGame fineGame={statoPartita} winner={winnerName}/>}

			{playerColor &&
				<div className="center" id="game">
					{/*Rotate board*/}
					<div id="switchBoard"> 
						<FontAwesomeIcon icon={faArrowsRotate} onClick={() => {document.getElementById("board").classList.toggle("black")}}/> 
					</div>
					{/*Arrows*/}
					<div id="arrows" >
						<div onMouseDown={() => setLeftArrowClicked(true)} onMouseUp={() => setLeftArrowClicked(false)} className='arrow left'><FontAwesomeIcon icon={faAngleLeft}/></div>
						<div onMouseDown={() => setRightArrowClicked(true)} onMouseUp={() => setRightArrowClicked(false)} className='arrow right'><FontAwesomeIcon icon={faAngleRight}/></div>
					</div>
					{/*Board*/}
					<Board userName={userName} idMatch={idMatch} statoPartita={statoPartita} setStatoPartita={setStatoPartita} spectator={spectator} playerColor={playerColor} leftArrowClicked={leftArrowClicked} rightArrowClicked={rightArrowClicked} setRightArrowClicked={setRightArrowClicked}/>
				</div>
			}
			
			
			{/*SingOut button*/}
        	<SingOut/>
    	</>
  	)
}

export default Game
