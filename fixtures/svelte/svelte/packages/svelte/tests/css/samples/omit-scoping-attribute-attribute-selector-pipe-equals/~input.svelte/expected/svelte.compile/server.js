import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><p data-foo="bar" class="svelte-be1n8t">this is styled</p> <p data-foo="bar-baz" class="svelte-be1n8t">this is styled</p> <p data-foo="baz-bar">this is unstyled</p></div>`);
}