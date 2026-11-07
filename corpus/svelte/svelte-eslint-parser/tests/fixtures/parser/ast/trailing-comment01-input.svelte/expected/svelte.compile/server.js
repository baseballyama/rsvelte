import * as $ from 'svelte/internal/server';

export default function Trailing_comment01_input($$renderer) {
	let a = 1;
	let b = /a/;

	$$renderer.push(`<input type="number"${$.attr(
		'value',
		//
		a
	)}/>`);
}