import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let state = { title: 'foo' };

	if (state) {
		$$renderer.push('<!--[0-->');

		const attributes = { title: state.title };

		Component($$renderer, $.spread_props([attributes]));
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <button>Del</button>`);
}