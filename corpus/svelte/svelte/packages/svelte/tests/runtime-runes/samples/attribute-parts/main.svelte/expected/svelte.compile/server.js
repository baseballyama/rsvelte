import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let a = 1;
	let b = 2;
	let c = 3;

	$$renderer.push(`<div class="123"></div> <img src="12 hello, world 13"/>`);
}