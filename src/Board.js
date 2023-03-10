import { useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { onSnapshot } from 'firebase/firestore';

import generateBoard from './initialate/generateBoard.js';
import Piece from './Piece.js'

import writeLogToDb from "./firebase/writeLogToDb";
import { initialateGame } from './initialate/initialateGame.js';
import { nRowPieces } from './initialate/BoardScheme.js';
import { getLastLogQuery } from './firebase/firebaseFunctions'
import { updatePiecePos, findIndexBoard, getPosFromEvent } from "./movement/movmentFunctions";
import { moveToLog} from './logUpdate/logUpdateFunctions.js';
import  FineGame from './fineGame/FineGame';
import Move from './Move.js';

import { getValidMoves, isCheckMate } from './referee'

function Board({userName}){
    const [pieces, setPieces] = useState([[],[],[],[],[],[],[],[]]);
	const [nLog, setNLog] = useState(0);
	const [playerColor, setPlayerColor] = useState();
	const [colorTurn, setColorTurn] = useState("white");
	const [lastLog, setLastLog] = useState(undefined);
	const [possibleMoves, setPossibleMoves] = useState([]);
	const [activePiece, setActivePiece] = useState();
	const [lastMovedPiece, setLastMovedPiece] = useState(null); 
	const [statoPartita, setStatoPartita] = useState("");

	const boardRef = useRef();
	//id del game (preso dall'url)
	const idMatch = useLocation().pathname.split("/")[2]

	function movePiece(e) {
		if (activePiece == undefined) return;

		let newPieces = [...pieces]
		let p = newPieces[activePiece.style.getPropertyValue("--y")][activePiece.style.getPropertyValue("--x")]
		//determinate the position in the board (from cordinate to index of the board)
		let [posX, posY] = getPosFromEvent(e);
		let [newX, newY] = findIndexBoard(posX, posY, boardRef, nRowPieces, playerColor === "black");

		//rimetto il piece all'altezza normale
		activePiece.classList.remove("topLevel", "active");

		//update delle posizioni se validMove e se il suo turno 
		if (colorTurn === playerColor && possibleMoves.some( move => move.x === newX && move.y === newY)){
			//aggiorno il db solo se la inserisco, se lascio stringa vuota non lo aggiorna
			writeLogToDb(p, newX, newY, `${idMatch}/logs${playerColor}/log${nLog}`);

			//aggiorno nLog e colore del prossimo turno e gli ultimi pezzi mossi
			setNLog(parseInt(nLog)+2);
			setColorTurn(p.color === "black" ? "white" : "black")
			setLastMovedPiece({newX: newX, newY:newY, x:p.x, y:p.y});
			//muovo il pezzo
			setPieces(updatePiecePos(newPieces, p, newX, newY, lastLog))
			//resetto l'activepiece
			setActivePiece(undefined);
			//elimino i posssibleMoves dallo schermo perche' mosso il piece
			setPossibleMoves(null);
		//altrimenti da mettere il pezzo dove stava prima quindi richiamo quello che fa il css ogni volta
		}else {
			activePiece.style.left = `calc(100 * ${p.x} / ${nRowPieces} * 1%)`;
			activePiece.style.top = `calc(100 * ${p.y} / ${nRowPieces} * 1%)`;
		}
	}

	function clickPiece(e) {
		//no preview dragging image
		e.preventDefault();
		//click of the board oppure clicco un elemento colore opposto
		if (e.target.id === "boardImg" || !e.target.classList.contains(playerColor) || statoPartita)  return;

		//possibleMoves
		setPossibleMoves(getValidMoves(parseInt(e.target.style.getPropertyValue("--x")),parseInt(e.target.style.getPropertyValue("--y")), [...pieces], lastLog));
		//aggiorno l'activePiece
		setActivePiece(e.target);
	}

	function dragPiece(e){
		//nothing selected
		if (activePiece == undefined) return;
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
		if (playerColor === "black"){
			shiftX = boardRef.current.offsetWidth - (shiftX + activePiece.offsetWidth) ;
			shiftY = boardRef.current.offsetHeight -  (shiftY + activePiece.offsetWidth) ;
		}

		//set the element new position when dragged
		//newPos = mousePos - spazio tra la finestra e la scacchiera (perche' i piece sono absolute alla scacchiera) - meta' della grandezza del piece
		activePiece.style.left = shiftX + "px";
		activePiece.style.top = shiftY + "px";
	}

	//aggiorno la posizione se nuovo log
	useEffect(() => {
		// lastLog = {data: {x,y,newX,newY,color,createdAt}, id:logwhite10}
		// se chiamato dopo moveToLastLog viene mosso due volte il log, cosi si controlla che nella posizione che si voglia spostare c'e' un pezzo
		if (!lastLog || !pieces[lastLog.data.y][lastLog.data.x]) return;

		let newPieces = moveToLog([...pieces], lastLog)
		//refresh delle possibilita' dopo lo spostamento
		setPossibleMoves(activePiece && getValidMoves(parseInt(activePiece.style.getPropertyValue("--x")),parseInt(activePiece.style.getPropertyValue("--y")), [...newPieces], lastLog));
		setPieces(newPieces);
		//il prossimo e' quello che ora e' in ascolto del db visto che siamo in ascolto solo dei lastLog degli avversari
		setColorTurn(playerColor);
		//setto il pieceMosso come lastMovedPiece
		setLastMovedPiece({newX: lastLog.data.newX, newY:lastLog.data.newY, x: lastLog.data.x, y:lastLog.data.y});
	}, [lastLog])

	useEffect(() => {
		//sconfitta
		if (pieces[0].length !== 0 && isCheckMate([...pieces], colorTurn, lastLog)){
			if (colorTurn === playerColor)
				setStatoPartita("sconfitta");
			else 
				setStatoPartita("vittoria");
			setPieces([...pieces]);
		}
	}, [colorTurn])

	//initzializzo il game, boardColor, i pezzi della scacchiera, il turno 
	useEffect(() => {
		let pieces = generateBoard();

		initialateGame(pieces, idMatch, userName).then(({nLog, colorTurn, boardColor, newPieces, lastMovedPiece, lastLog}) => {
			setNLog(nLog);
			setColorTurn(colorTurn);
			setPlayerColor(boardColor);
			setPieces(newPieces);
			setLastMovedPiece(lastMovedPiece);
			setLastLog(lastLog);

			//real time data dal db, ogni volta che c'e un aggiornamento aggiorna lo state lastLog
			getLastLogQuery("matches", `${idMatch}/logs${(boardColor === "white" ? "black" : "white")}`).then((query) => {
				onSnapshot(query, (arrLastLog) => {
					//se non e' nullo l'array aggiorno lo state dell'ultimo log (e poi viene chiamato l'useEffect che aggiorna la board) oppure se ho gia' fatto il log che sta leggendo ora dal server
					if (arrLastLog.docs.length && (!lastLog || arrLastLog.docs[0].id.split("log")[1] > lastLog.id.split("log")[1]))
						setLastLog({data:arrLastLog.docs[0].data(), id:arrLastLog.docs[0].id});
				});
			})
		});

	}, []);

	//update playerColor in localStorage
	// useEffect(() => {localStorage.setItem("playerColor", playerColor)}, [playerColor])
	return(
		<div 
			id="board" 
			className={`${playerColor} center`}
			onMouseDown={clickPiece} 
			onMouseUp={movePiece} 
			onMouseMove={dragPiece} 
			onTouchStart={clickPiece}
			onTouchEnd={movePiece}
			onTouchMove={dragPiece}
		>
			{statoPartita && <FineGame fineGame={statoPartita}/>}
			<div ref={boardRef} id="boardPieces">
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

				{
					//all moves
					possibleMoves && possibleMoves.map(move => {
						if (!move) return null;
						const key = `x:${move.x}y:${move.y}`;
						return <Move key={key} move={move} type="dot"/>
					})
				}
			</div>


			<div id="pieces">
				{
					//pieces of the board
					pieces.map(pieceRow => {
						return pieceRow.map((piece, index)=> {
							if (!piece) return null;
							const key = `${piece.id}-row-${index}`;
							return <Piece key={key} piece={piece}/>
						})
					})
				}
			</div>
		</div>
	)

}


export default Board;
