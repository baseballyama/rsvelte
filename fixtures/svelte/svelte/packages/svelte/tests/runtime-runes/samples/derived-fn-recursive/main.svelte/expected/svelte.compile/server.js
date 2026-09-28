import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	let even = $.derived(() => {
		return count > 0 ? even() : 0;
	});

	$$renderer.push(`<button>increment</button> ${$.escape(even())}`);
}