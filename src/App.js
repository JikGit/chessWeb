import SingIn from './auth/SingIn';
import Game from './Game';

import { Route, Routes } from "react-router-dom"

function App() {
	let randomMatchId = localStorage.getItem("idMatch") || parseInt(Math.random() * 1000000000);
	let user = localStorage.getItem("userName");
	// <Route path="/*" element={user? } replace />: <SingIn/>}/>
	return (
		<div className='App'>
			<Routes>
				<Route path="*" element={user? <Game userName={user} idMatch={randomMatchId}/> : <SingIn/>}/>
			</Routes>
		</div>
	);
}

export default App;
