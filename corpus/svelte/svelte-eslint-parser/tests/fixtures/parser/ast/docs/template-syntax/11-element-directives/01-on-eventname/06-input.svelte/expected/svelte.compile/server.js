import * as $ from 'svelte/internal/server';

export default function _6_input($$renderer) {
	let counter = 0;

	function increment() {
		counter = counter + 1;
	}

	function track(event) {
		trackEvent(event);
	}

	$$renderer.push(`<button>Click me!</button>`);
}