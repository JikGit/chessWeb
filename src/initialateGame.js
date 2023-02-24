import { readCollection, doesDocExist} from './firebase/firebaseFunctions'
import { checkForExistingPlayer, addPlayer } from './managePlayer';
import { moveTillLastLog } from './logUpdate/logUpdateFunctions';

export async function initialateGame(newPieces, idMatch, userName){
    let boardColor = "white";
    let colorTurn = "white";
    let nLog = 0;
    let lastMovedPiece;
	let lastLog;

    //nuova partita
    if (!await doesDocExist("matches", `${idMatch}`)){
        // createData("matches", `${idMatch}/board/initialBoard`, objBoard)
        addPlayer("white", userName, idMatch);
    //se gia' esiste il game
    }else{
        //controllo se l'utente era in game anche prima, se lo e' gli metto il color di prima
        let alreadyExistingPlayer = await checkForExistingPlayer(userName, idMatch);
        if (alreadyExistingPlayer) boardColor = alreadyExistingPlayer;
        //altrimenti e' nero
        else{
            addPlayer("black", userName);
            boardColor = "black";
            nLog = 1;
        }

        //se ci sono logs da updatare
        let allLogs = (await readCollection(`matches/${idMatch}/logsblack`)).concat(await readCollection(`matches/${idMatch}/logswhite`))
        //li metto in ordine di createdAt (quindi in ordine di gioco)
        allLogs.sort((log1, log2) => log1.data.createdAt - log2.data.createdAt);
        //sposto tutti i log
        if (allLogs.length !== 0){
            newPieces = moveTillLastLog(newPieces, allLogs);
            //setto il numero di log e turno (presi dal data dell'ultimo log)
            nLog = allLogs.at(-1).data.color === boardColor ? parseInt(allLogs.at(-1).id.split("log")[1])+2 : parseInt(allLogs.at(-1).id.split("log")[1])+2;
            colorTurn = allLogs.at(-1).data.color === "black" ? "white" : "black";
            lastMovedPiece = {x:allLogs.at(-1).data.x, y:allLogs.at(-1).data.y, newX:allLogs.at(-1).data.newX, newY:allLogs.at(-1).data.newY};
			lastLog = allLogs.at(-1);
        }
    }



    //aggiorno i pezzi, nLog, turno e il colore dell'utente
    return {nLog: nLog,colorTurn: colorTurn, boardColor: boardColor, newPieces: newPieces, lastMovedPiece: lastMovedPiece, lastLog: lastLog}
}
