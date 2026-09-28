import * as $ from 'svelte/internal/server';
import Stale from '../Stale.svelte';

export default function _page($$renderer) {
	let shown = false;

	$$renderer.push(`<button data-testid="toggle">toggle</button> `);

	if (shown) {
		$$renderer.push('<!--[0-->');
		Stale($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <a href="/snapshot/stale/a">a</a>`);
}