import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let show = false;

	$$renderer.push(`<div style="width: 100%; height: 9999px;"></div> <button>toggle</button> `);

	if (show) {
		$$renderer.push('<!--[0-->');
		Child($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}