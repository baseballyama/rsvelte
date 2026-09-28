import * as $ from 'svelte/internal/server';

export default function Dynamic_classes($$renderer) {
	let open = false;

	$$renderer.push(`<div class="container svelte-1qwf8ul"><button class="svelte-1qwf8ul"><span>Accordion</span> <span${$.attr_class(`trigger ${open ? 'open' : ''}`, 'svelte-1qwf8ul')}>👈️</span></button></div>`);
}