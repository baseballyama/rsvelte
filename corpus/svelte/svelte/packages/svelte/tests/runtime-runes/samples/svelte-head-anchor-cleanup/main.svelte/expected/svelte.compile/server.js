import * as $ from 'svelte/internal/server';
import Head from './Head.svelte';

export default function Main($$renderer) {
	let show = false;

	$$renderer.push(`<button>toggle</button> `);

	if (show) {
		$$renderer.push('<!--[0-->');
		Head($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}