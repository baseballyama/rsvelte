import * as $ from 'svelte/internal/server';
import SharedCSS from '#lib/SharedCSS.svelte';
import '@fontsource/libre-barcode-128-text';

export default function _page($$renderer) {
	$$renderer.push(`<p class="svelte-18xh00l">Test that the fontsource is referenced correctly, while the shared CSS in SharedCSS doesn't cause
	problems</p> `);

	SharedCSS($$renderer, {});
	$$renderer.push(`<!---->`);
	// @ts-ignore this is a vite font import so it has no side-effect types
}