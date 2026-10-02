import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo;
	let bar;

	bar = foo = 1;
	$$renderer.push(`<h1>${$.escape(foo)} ${$.escape(bar)}</h1>`);
}