import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let x = 0;
	const cleanup = () => {};

	$$renderer.push(`<button>${$.escape(x)}</button> <button>cleanup</button>`);
}