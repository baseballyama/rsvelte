import * as $ from 'svelte/internal/server';

export default function Ignore_test04_input($$renderer) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;

	$$renderer.push(`<button class=" ac d">foo</button>`);
}