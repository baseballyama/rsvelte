import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { destroyed } from './destroyed.js';
import C from './C.svelte';

export default function A($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onDestroy(() => destroyed.push('A'));
		$$renderer.push(`<div>A</div> `);
		C($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}