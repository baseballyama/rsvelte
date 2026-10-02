import * as $ from 'svelte/internal/server';

export default function Html_tags02_input($$renderer) {
	let string = `this string contains some <strong>HTML!!!</strong>`;

	$$renderer.push(`<p>${$.html(string)}</p>`);
}