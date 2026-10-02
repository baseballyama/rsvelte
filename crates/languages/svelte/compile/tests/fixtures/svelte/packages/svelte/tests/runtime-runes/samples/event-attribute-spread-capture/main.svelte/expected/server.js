import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let captured = false;

	const properties = {
		/** @param {MouseEvent} event */
		onclickcapture: (event) => {
			captured = event.eventPhase === event.CAPTURING_PHASE;
		}
	};

	$$renderer.push(`<div${$.attributes({ ...properties })}><button>click me</button> <p>captured: ${$.escape(captured)}</p></div>`);
}