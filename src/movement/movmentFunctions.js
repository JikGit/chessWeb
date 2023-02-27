function updatePiecePos(newPieces, p, newX, newY, lastLog){
	//controllo enPassant, se mi muovo di due e non sono nella posizione di fare due mosse (quindi per forza enPassant)
	if (lastLog !== undefined && Object.keys(lastLog).length !== 0 && p.type === "pawn" && Math.abs(lastLog.data.y - lastLog.data.newY) === 2 && Math.abs(p.y - newY) === 2 && (p.color === "white" ? p.y !== 6 : p.y !== 1))
		newPieces = updatePiecePos(newPieces, p, newX, newY + (p.color === "white" ? 1 : -1), {}) //lastLog vuoto perche' serve solo per arrocco e enPassant
	//controllo per castle
	if (p.type === "king" && Math.abs(p.x - newX) === 2)
		newPieces = updatePiecePos(newPieces, newPieces[newY][newX === 2 ? 0 : 7], newX === 2 ? p.x-1 : p.x+1, newY, {}) //lastLog vuoto perche' serve solo per arrocco e enPassant


	//aggiorno la matrice
	p.hasMoved = true;
	newPieces[p.y][p.x] = null;
	[p.x, p.y] = [newX, newY]
	newPieces[newY][newX] = p;
	return newPieces
}


//trova l'index x,y del pezzo dalla maatrice pieces
function findIndexBoard(posX, posY, containerRef, indexBoard, black = false){
	//(int(posmovingPiece - posBoard / lenghtmovingPiece))
	let lenghtmovingPiece = containerRef.current.offsetWidth / indexBoard;
	let [newX, newY] = [parseInt((posX - containerRef.current.getBoundingClientRect().x) / lenghtmovingPiece), 
		parseInt((posY - containerRef.current.getBoundingClientRect().y) / lenghtmovingPiece)]
	//se e' nero devo specchiare tutto perche' la board e' al contrario nei pieces
	if (black)
		[newX, newY] = [indexBoard - newX - 1, indexBoard - newY - 1];
	return [newX, newY];
}

//in base al fatto se e' un touch/movement da telefono e da mouse
function getPosFromEvent(e){
	if(e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel'){
		var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
		var touch = evt.touches[0] || evt.changedTouches[0];
		return [touch.pageX, touch.pageY]
	} else if (e.tposYpe === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover'|| e.type==='mouseout' || e.type==='mouseenter' || e.type==='mouseleave') 
		return [e.clientX, e.clientY];
}




export {updatePiecePos, findIndexBoard, getPosFromEvent}
