import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<p class="foo svelte-1hv69w1">this is styled</p> <p class="bar">this is unstyled</p>`);
}