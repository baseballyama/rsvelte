import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { destroyed } from './destroyed.js';
import C from './C.svelte';

export default function B($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let yes = 1;

		onDestroy(() => destroyed.push('B'));
		$$renderer.push(`<div>`);

		if (yes) {
			$$renderer.push('<!--[0-->');
			C($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}