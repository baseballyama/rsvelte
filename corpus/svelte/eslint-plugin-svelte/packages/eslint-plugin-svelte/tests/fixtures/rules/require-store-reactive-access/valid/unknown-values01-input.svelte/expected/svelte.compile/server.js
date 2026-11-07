import * as $ from 'svelte/internal/server';

export default function Unknown_values01_input($$renderer) {
	const numValue = 42;
	const strValue = 'string';
	let anyValue;

	$$renderer.push(`<p>42</p> <p>string</p> <p>${$.escape(anyValue)}</p>`);
}