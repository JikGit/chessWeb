import '../css/singOut.css'
function SingOut() {
	function exitAcc(){
		localStorage.setItem("userName", "")
		window.location.reload();
	}

	return (
		<div id="singOut" onClick={exitAcc}>
			<p className='title'>Cambia Nome</p>
		</div>
	);
}

export default SingOut;
