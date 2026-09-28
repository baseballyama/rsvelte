import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><p data-foo="foobarbaz" class="svelte-11cnpi8">this is styled</p> <p data-foo="fooBARbaz">this is unstyled</p></div>`);
}