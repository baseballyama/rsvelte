import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let captured = false;

	/** @param {MouseEvent} event */
	const onclickcapture = (event) => {
		captured = event.eventPhase === event.CAPTURING_PHASE;
	};

	$$renderer.push(`<div><button>click me</button> <p>captured: ${$.escape(captured)}</p></div>`);
}