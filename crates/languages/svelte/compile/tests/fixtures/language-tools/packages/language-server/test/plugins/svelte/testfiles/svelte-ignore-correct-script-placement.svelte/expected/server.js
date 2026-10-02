import * as $ from 'svelte/internal/server';

export default function Svelte_ignore_correct_script_placement($$renderer) {
	let a = 1;
	let b = a;

	$$renderer.push(`<p></p> <p></p>`);
}