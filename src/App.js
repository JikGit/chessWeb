import Board from './Board'
import './css/app.css';
import './css/board.css';
import SingIn from './auth/SingIn';
import SingOut from './auth/SingOut'

import { Route, Routes, Navigate} from "react-router-dom"

function App() {
	let randomMatchId = parseInt(Math.random() * 1000000000);
	let user = localStorage.getItem("userName");
	return (
		<div className='App'>
			<Routes>
				<Route path="/*" element={user? <Navigate to={`/match/${randomMatchId}`} replace />: <SingIn/>}/>
				<Route path="/match/*" element={user? <Board userName={user && user}/> : <SingIn/>}/>
			</Routes>
			<SingOut/>
		</div>
	);
}

export default App;
