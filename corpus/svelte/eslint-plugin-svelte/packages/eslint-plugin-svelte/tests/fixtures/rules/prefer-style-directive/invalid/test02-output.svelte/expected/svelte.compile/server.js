import * as $ from 'svelte/internal/server';

export default function Test02_output($$renderer) {
	$$renderer.push(`<div${$.attr_style('width: 12px', { color: red })}>...</div>`);
}