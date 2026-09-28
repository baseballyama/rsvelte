import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let show = true;

	$$renderer.push(`<button>click</button> `);

	if (show) {
		$$renderer.push('<!--[0-->');
		Component($$renderer, {});
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}