import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function _page($$renderer) {
	let show = false;

	$$renderer.push(`<h1 id="always" class="svelte-1ui5twj">This is always rendered</h1> <button>show component</button> `);

	if (show) {
		$$renderer.push('<!--[0-->');
		Component($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}