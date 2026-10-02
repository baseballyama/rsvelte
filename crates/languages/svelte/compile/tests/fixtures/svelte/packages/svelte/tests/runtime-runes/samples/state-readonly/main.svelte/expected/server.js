import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let state = void 0;

	$$renderer.push(`<button></button> `);

	if (state) {
		$$renderer.push('<!--[0-->');
		Component($$renderer, { state });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}