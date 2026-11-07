import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { destroyed } from './destroyed.js';

export default function B($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		onDestroy(() => destroyed.push('B'));
		onDestroy(() => destroyed.push('B*'));
		$$renderer.push(`<div>B</div>`);
	});
}