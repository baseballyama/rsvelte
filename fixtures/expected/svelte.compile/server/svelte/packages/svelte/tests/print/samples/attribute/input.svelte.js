import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div class="foo" data-foo="bar"></div>`);
}