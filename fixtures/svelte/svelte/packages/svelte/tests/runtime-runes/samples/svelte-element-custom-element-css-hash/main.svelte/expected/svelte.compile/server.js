import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.element($$renderer, 'custom-element', () => {
		$$renderer.push(` class="red svelte-5ruto1"`);
	});

	$$renderer.push(` <custom-element class="red svelte-5ruto1"></custom-element>`);
}