import {useRef} from 'react';
import '../css/singIn.css';

function SingIn() {
	const inputRef = useRef();
	return (
		<div className="container">
		  <form>
			<p>Inserisci nome</p>
			<input ref={inputRef} type="text" placeholder="Nome"/><br/>
			<button onClick={() => {setName(inputRef.current.value);window.location.href='/'}}>Invio</button>
		  </form>

		  <div className="drops">
			<div className="drop drop-1"></div>
			<div className="drop drop-2"></div>
			<div className="drop drop-3"></div>
			<div className="drop drop-4"></div>
			<div className="drop drop-5"></div>
		  </div>
		</div>
	);
}

function setName(name){
	localStorage.setItem("userName", name)
}

export default SingIn;
