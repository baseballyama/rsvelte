import * as $ from 'svelte/internal/server';

export default function Test03_output($$renderer) {
	$$renderer.push(`<div${$.attr_style('', { color: 'red' })}>...</div>`);
}