import * as $ from 'svelte/internal/server';

export default function Typescript01_input($$renderer) {
	const handler = (ev) => {
		console.log(ev);
	};

	window.addEventListener('message', handler);
	window.addEventListener('message', handler);
	$$renderer.push(`<div>Hello</div>`);
}