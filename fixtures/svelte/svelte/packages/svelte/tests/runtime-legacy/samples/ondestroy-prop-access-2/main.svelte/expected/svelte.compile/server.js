import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let value = { foo: 'bar' };

	$$renderer.push(`<button>Reset value</button> `);

	if (value !== undefined) {
		$$renderer.push('<!--[0-->');
		Component($$renderer, { my_prop: value });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}