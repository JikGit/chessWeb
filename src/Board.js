import './css/board.css';
import './css/boardPieces.css'

import { useRef, useState, useEffect } from 'react'
import { onSnapshot } from 'firebase/firestore';

import { nRowPieces } from './initialate/BoardScheme.js';
import generateBoard from './initialate/generateBoard.js';
import { checkForNewMovedPiece } from './initialate/initialateGame';

import Piece from './Piece.js'
import writeLogToDb from "./firebase/writeLogToDb";
import { getLastLogQuery } from './firebase/firebaseFunctions'
import { updatePiecePos, findIndexBoard, getPosFromEvent } from "./movement/movmentFunctions";
import { moveToLog, moveToLogLeft, moveToLogRight } from './log/logUpdateFunctions';
import Move from './Move.js';
import { getValidMoves, isCheck, isCheckMate } from './referee'

//sound import
import checkSound from './assets/sounds/check.mp3'
import sconfittaSound from './assets/sounds/check.mp3'

function Board({idMatch, statoPartita, setStatoPartita, playerColor, spectator, leftArrowClicked, rightArrowClicked}){
    const [pieces, setPieces] = useState([[],[],[],[],[],[],[],[]]);
	const [colorTurn, setColorTurn] = useState("white");
	const [lastLog, setLastLog] = useState({});
	const [possibleMoves, setPossibleMoves] = useState([]);
	const [activePiece, setActivePiece] = useState();
	const [lastMovedPiece, setLastMovedPiece] = useState(null); 
	const [stateArrows, setStateArrows] = useState(0)
	const [moveOpponentPiece, setMoveOpponentPiece] = useState({});

	const boardRef = useRef();

	function updateStateMovedPiece(p, newX, newY, newPieces){
		//aggiorno colore del prossimo turno e gli ultimi pezzi mossi
		setColorTurn(p.color === "black" ? "white" : "black")
		setLastMovedPiece({newX: newX, newY:newY, x:p.x, y:p.y});
		//muovo il pezzo
		setPieces(updatePiecePos(newPieces, p, newX, newY, true))
		//resetto l'activepiece
		setActivePiece(undefined);
		//elimino i posssibleMoves dallo schermo perche' mosso il piece
		setPossibleMoves(null);
	}

	function checkMovePiece(e) {
		//se nessun pezzo selezionato oppure siamo in specator mode non lo muovo
		if (activePiece === undefined || spectator)  return;

		let newPieces = [...pieces]
		let p = newPieces[activePiece.style.getPropertyValue("--y")][activePiece.style.getPropertyValue("--x")]
		//determinate the position in the board (from cordinate to index of the board)
		let [posX, posY] = getPosFromEvent(e);
		let [newX, newY] = findIndexBoard(posX, posY, boardRef, nRowPieces, boardRef.current.classList.contains("black")); //contains e non playerColor perche' se giro la board non cambia il playerColor ma la classe si

		//rimetto il piece all'altezza normale
		activePiece.classList.remove("topLevel", "active");
		//update delle posizioni se validMove e se il suo turno 
		if (colorTurn === playerColor && possibleMoves.some( move => move.x === newX && move.y === newY)){
			//aggiorno il db solo se la inserisco, se lascio stringa vuota non lo aggiorna
			writeLogToDb(p, newX, newY, `${idMatch}/logs${playerColor}/log${lastLog ? parseInt(lastLog.id.split("log")[1])+1 : 0}`, (newPieces[newY][newX]? pieces[newY][newX].id: ""));
			//effetto sonoro
			updateStateMovedPiece(p, newX, newY, newPieces);
		//altrimenti da mettere il pezzo dove stava prima quindi richiamo quello che fa il css ogni volta
		}else {
			activePiece.style.left = `calc(100 * ${p.x} / ${nRowPieces} * 1%)`;
			activePiece.style.top = `calc(100 * ${p.y} / ${nRowPieces} * 1%)`;
		}
	}

	function clickPiece(e) {
		//no preview dragging image
		if(!(e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel'))
			e.preventDefault();
		//click of the board oppure clicco un elemento colore opposto
		if (e.target.id === "boardImg" || !e.target.classList.contains(playerColor) || stateArrows != 0 || statoPartita)  return;
		//possibleMoves
		setPossibleMoves(getValidMoves(parseInt(e.target.style.getPropertyValue("--x")),parseInt(e.target.style.getPropertyValue("--y")), [...pieces], lastLog));
		//aggiorno l'activePiece
		setActivePiece(e.target);
	}

	function dragPiece(e){
		//se nessun pezzo selezionato oppure siamo in specator mode non lo muovo
		if (activePiece === undefined || spectator)  return;
		//se event dal mouse e non sto premento il mouse allora ho solo cliccato, quindi il piece non deve seguire il cursore 
		if ((e.type !== 'touchstart' && e.type !== 'touchmove' && e.type !== 'touchend' && e.type !== 'touchcancel')
			&& ! (e.buttons !== undefined ? e.buttons : e.which))  return
		let [posX, posY] = getPosFromEvent(e);

		//pongo in alto a tutto il piece
		activePiece.classList.add("topLevel", "active");

		//lo spazio tra la board e ogni pezzo
		let shiftX = posX - boardRef.current.getBoundingClientRect().x - activePiece.offsetWidth / 2;
		let shiftY = posY - boardRef.current.getBoundingClientRect().y - activePiece.offsetWidth / 2;
		//se nero devo ruotare di 180 gradi perche' la scacchiera e' ruotata
		if (boardRef.current.classList.contains("black")){
			shiftX = boardRef.current.offsetWidth - (shiftX + activePiece.offsetWidth) ;
			shiftY = boardRef.current.offsetHeight -  (shiftY + activePiece.offsetWidth) ;
		}

		//set the element new position when dragged
		//newPos = mousePos - spazio tra la finestra e la scacchiera (perche' i piece sono absolute alla scacchiera) - meta' della grandezza del piece
		activePiece.style.left = shiftX + "px";
		activePiece.style.top = shiftY + "px";
	}


	useEffect(() => {
		//sconfitta
		if (pieces[0].length === 0 || statoPartita)  return;
		let isMate = isCheckMate([...pieces], colorTurn, lastLog);

		if (isCheck([...pieces], colorTurn, lastLog)){
			if (isMate){
				new Audio(sconfittaSound).play();
				if (colorTurn === playerColor)
					setStatoPartita("sconfitta");
				else 
					setStatoPartita("vittoria");
				setPieces([...pieces]);
			}else
				new Audio(checkSound).play();
		}else
			if (isMate) setStatoPartita("stalemate");
	}, [colorTurn])

	//se clicco il tasto sinistro
	useEffect(() => {
		if (!leftArrowClicked) return;
		moveToLogLeft(idMatch, stateArrows, lastLog, playerColor, colorTurn, pieces, true).then(newPieces => {
			if (newPieces){
				setPieces(newPieces);
				setStateArrows(stateArrows+1);
			}
		});

	}, [leftArrowClicked])

	//se clicco il tasto destro
	useEffect(() => {
		if (!rightArrowClicked) return;
		moveToLogRight(idMatch, stateArrows, lastLog, playerColor, colorTurn, pieces, true).then(newPieces => {
			if (newPieces){
				setPieces(newPieces);
				setStateArrows(stateArrows-1);
			}
		});
	}, [rightArrowClicked])

	async function moveTillLastArrowState(){
		let newPieces = [...pieces];
		for (let i = 0; i < stateArrows; i++)
			newPieces = await moveToLogRight(idMatch, stateArrows-i, lastLog, playerColor, colorTurn, newPieces, false)
		return newPieces;
	}

	useEffect(() => {
		//state nullo (appena inizializzato)
		if (Object.keys(moveOpponentPiece).length === 0) return

		async function asyncMoveOpponentPiece(){
			//muove fino all'ultimo movimento, come se premesse la freccia destra tutte le volte
			let newPieces = [...pieces];
			if (stateArrows !== 0){
				newPieces = await moveTillLastArrowState();
				setStateArrows(0);
			}

			//muovo il pezzo
			newPieces = moveToLog(newPieces, moveOpponentPiece, true)
			//aggiorno i vari state
			setPieces(newPieces);
			//refresh delle possibilita' dopo lo spostamento
			setPossibleMoves(activePiece && getValidMoves(parseInt(activePiece.style.getPropertyValue("--x")),parseInt(activePiece.style.getPropertyValue("--y")), [...newPieces], moveOpponentPiece));
			//il prossimo e' quello che ora e' in ascolto del db visto che siamo in ascolto solo dei moveOpponentPiece degli avversari
			setColorTurn(playerColor);
			//setto il pieceMosso come lastMovedPiece
			setLastMovedPiece({newX: moveOpponentPiece.data.newX, newY:moveOpponentPiece.data.newY, x: moveOpponentPiece.data.x, y:moveOpponentPiece.data.y});
			//aggiorno il lastLog state
			setLastLog(moveOpponentPiece)
		}
		asyncMoveOpponentPiece();
	}, [moveOpponentPiece])
	

	//initzializzo il game, boardColor, i pezzi della scacchiera, il turno 
	useEffect(() => {
		let pieces = generateBoard();
		checkForNewMovedPiece(pieces, idMatch, playerColor).then(({colorTurn, newPieces, lastMovedPiece, lastLog}) => {
			setPieces(newPieces);
			setLastMovedPiece(lastMovedPiece);
			setLastLog(lastLog);
			setColorTurn(colorTurn);

			//real time data dal db, ogni volta che c'e un aggiornamento aggiorna lo state lastLog
			getLastLogQuery("matches", `${idMatch}/logs${(playerColor === "white" ? "black" : "white")}`).then((query) => {
				onSnapshot(query, (arrLastLog) => {
					//se non e' nullo l'array aggiorno lo state dell'ultimo log (e poi viene chiamato l'useEffect che aggiorna la board) oppure se ho gia' fatto il log che sta leggendo ora dal server
					if (arrLastLog.docs.length && (!lastLog || parseInt(arrLastLog.docs.at(-1).id.split("log")[1]) > parseInt(lastLog.id.split("log")[1])))
						setMoveOpponentPiece({data:arrLastLog.docs.at(-1).data(), id:arrLastLog.docs.at(-1).id});
				});
			})
		});
	}, []);

	//update playerColor in localStorage
	return(
		<div 
			ref={boardRef}
			id="board" 
			className={playerColor}
			onMouseDown={clickPiece} 
			onMouseUp={checkMovePiece} 
			onMouseMove={dragPiece} 
			onTouchStart={clickPiece}
			onTouchEnd={checkMovePiece}
			onTouchMove={dragPiece}
		>

			<div  id="boardPieces">
				{
					[...Array(64).keys()].map((number) => {
						return <div key={number}></div>
					})
				}
			</div>

			<div id="moves">
				{/* pezzo in moviment ora, ultimi pezzi mossi, prima i punti di arrivo e poi di fine */} 
				{activePiece && <Move move={{x:parseInt(activePiece.style.getPropertyValue("--x")), y:parseInt(activePiece.style.getPropertyValue("--y"))}} type="newCordinates"/>}
				{lastMovedPiece && <Move move={{x:lastMovedPiece.newX, y:lastMovedPiece.newY}} type="newCordinates"/>}
				{lastMovedPiece && <Move move={{x:lastMovedPiece.x, y:lastMovedPiece.y}} type="prevsCordinates"/>}
				{//all moves
					possibleMoves && possibleMoves.map(move => {
						if (!move) return null;
						return <Move key={`x:${move.x}y:${move.y}`} move={move} type="dot"/>
					})
				}
			</div>

			<div id="pieces">
				{//pieces of the board
					pieces.map(pieceRow => {
						return pieceRow.map((piece, index)=> {
							if (!piece) return null;
							return <Piece key={`${piece.id}-row-${index}`} piece={piece}/>
						})
					})
				}
			</div>
		</div>
	)

}


export default Board;
