import React from 'react'
import { useState, useRef } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'

function MenuSelectable({items, callbackFunction}){
	const [barOpened, setBarOpened] = useState(false)
	const menuSelectableRef = useRef();
	
	function onMouseOver(){
		setBarOpened(true)
		menuSelectableRef.current.addEventListener("mouseleave", (() => {setBarOpened(false)}))
	}

	return (
		<div ref={menuSelectableRef} id="menuSelectable">
			<div id="topMenuElm">
				<p className="titleMenu">Temi</p>	
				<div 
					id="openCloseIcon"
					onMouseOver={onMouseOver}
					onClick={() => setBarOpened(!barOpened)}
				>
					<FontAwesomeIcon icon={barOpened ? faCaretUp : faCaretDown}/>
				</div>
			</div>

			{barOpened && 
				items.map(item=> 
					<div 
						className="option"
						onClick={callbackFunction}
						key={item}
					>
						<p>{item}</p>
					</div>
				)}
		</div>
	)
}

export default MenuSelectable; 
