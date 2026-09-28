import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div><p data-foo="barbaz" class="svelte-vqbvy5">this is styled</p> <p data-foo="bazbar">this is unstyled</p></div>`);
}