import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let a = 0;
	let b = 0;

	$$renderer.push(`<!----><button>${$.escape(a)}</button><button>${$.escape(b)}</button>`);
}