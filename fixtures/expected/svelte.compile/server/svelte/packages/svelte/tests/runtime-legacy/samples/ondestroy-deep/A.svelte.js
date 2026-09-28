import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { destroyed } from './destroyed.js';
import B from './B.svelte';

export default function A($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let yes = 1;

		onDestroy(() => destroyed.push('A'));
		$$renderer.push(`<div>`);

		if (yes) {
			$$renderer.push('<!--[0-->');
			B($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}