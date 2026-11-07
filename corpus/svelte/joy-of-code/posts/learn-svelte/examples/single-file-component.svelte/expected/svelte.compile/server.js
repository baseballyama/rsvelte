import * as $ from 'svelte/internal/server';

export default function Single_file_component($$renderer) {
	let title = 'Svelte';

	$$renderer.push(`<div class="container"><h1 class="svelte-1ikswi4">Svelte</h1></div>`);
}