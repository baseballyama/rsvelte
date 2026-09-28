import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let count = 0;

	$$renderer.push(`<button>${$.escape(count)}</button> `);

	if (count < 2) {
		$$renderer.push('<!--[0-->');
		Component($$renderer, { 'data-count': count });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}