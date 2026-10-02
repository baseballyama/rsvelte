import * as $ from 'svelte/internal/server';

export default function Style_directive03_input($$renderer) {
	const color = 'red';

	$$renderer.push(`<div${$.attr_style('', [{}, { color }])}></div>`);
}