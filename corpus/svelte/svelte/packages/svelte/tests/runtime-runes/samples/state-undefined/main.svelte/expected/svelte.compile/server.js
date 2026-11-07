import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo = void 0;

	$$renderer.push(`<button>${$.escape(foo)}</button>`);
}