import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const action = (element) => {
		console.log(element.id);
	};

	$$renderer.push(`<div id="5"><div id="3"><div id="1"></div> <div id="2"></div></div> <div id="4"></div></div> <div id="6"></div>`);
}