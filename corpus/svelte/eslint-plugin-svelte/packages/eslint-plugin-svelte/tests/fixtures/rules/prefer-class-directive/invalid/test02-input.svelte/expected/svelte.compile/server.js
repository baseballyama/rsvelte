import * as $ from 'svelte/internal/server';

export default function Test02_input($$renderer) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;

	$$renderer.push(`<button class=" a c d">foo</button>`);
}