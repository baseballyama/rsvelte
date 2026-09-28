import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let x = { a: 0, b: 0 };
	let count = 0;

	$$renderer.push(`<p>${$.escape(x.a)} - ${$.escape(x.b)}</p> <button>+</button>`);
}