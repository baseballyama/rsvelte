import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<a data-sveltekit-keepfocus=""></a> <a data-sveltekit-noscroll=""></a> <a data-sveltekit-preload-code=""></a> <a data-sveltekit-preload-data=""></a> <a data-sveltekit-reload=""></a> <a data-sveltekit-replacestate=""></a> `);

	$.element($$renderer, 'a', () => {
		$$renderer.push(` data-sveltekit-preload-data=""`);
	});
}