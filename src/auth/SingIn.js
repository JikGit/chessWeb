import {useRef} from 'react';
import '../css/singIn.css';

function SingIn({}) {
	const inputRef = useRef();
	return (
		<div className="inputFormContainer">
			<form>
				<p>Inserisci nome</p>
				<input ref={inputRef} type="text" placeholder="Nome"/><br/>
				<button onClick={() => {onClick(inputRef.current.value);window.location.href='/'}}>Invio</button>
			</form>
		</div>
	);
}

function onClick(name){
	localStorage.setItem("userName", name)
}

export default SingIn;
