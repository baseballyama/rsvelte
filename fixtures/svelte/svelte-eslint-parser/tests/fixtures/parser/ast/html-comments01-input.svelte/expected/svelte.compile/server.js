import * as $ from 'svelte/internal/server';

export default function Html_comments01_input($$renderer) {
	let a = '';

	$$renderer.push(`<input type="number"${$.attr('value', a)}/>`);
}