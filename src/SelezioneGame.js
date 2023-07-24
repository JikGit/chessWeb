import {useRef} from 'react';
import './css/selezioneGame.css'
import './css/singIn.css' //non serve perche inhereditato dato che ha stessi id 

function SelezioneGame({idMatch}) {
	const inputRef = useRef();

	return (
		<div id="idGameSelection" className="inputFormContainer">
			<form>
				<p className='title'>Inserisci id Partita</p>
				<input ref={inputRef} type="text" defaultValue={idMatch && idMatch}/><br/>
				<button type="submit" onClick={() => {setIdMatch(inputRef.current.value)}}>Invio</button>
			</form>
		</div>
	);
}

function setIdMatch(idMatch){
	localStorage.setItem("idMatch", idMatch);
}

export {SelezioneGame, setIdMatch};
