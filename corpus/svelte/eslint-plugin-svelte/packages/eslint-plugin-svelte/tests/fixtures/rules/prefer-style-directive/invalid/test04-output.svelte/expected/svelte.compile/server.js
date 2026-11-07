import * as $ from 'svelte/internal/server';

export default function Test04_output($$renderer) {
	$$renderer.push(`<div${$.attr_style('position:relative;', { display: 'block' })}>foo</div>`);
}