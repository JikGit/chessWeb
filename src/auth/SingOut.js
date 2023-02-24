import { Navigate } from 'react-router-dom'

function exitAcc(){
	localStorage.setItem("userName", "")
	return <Navigate to="/" replace/>
}


function SingOut() {
	return (
		<>
			<button id="singOutBtn" onClick={exitAcc}>SingOut</button>
		</>
	);
}

export default SingOut;
