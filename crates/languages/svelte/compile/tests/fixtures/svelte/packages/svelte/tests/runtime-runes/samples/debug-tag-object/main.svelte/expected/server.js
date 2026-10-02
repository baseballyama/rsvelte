import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = { current: 0 };

	console.log({ count });

	debugger;

	$$renderer.push(`<button>+</button>`);
}