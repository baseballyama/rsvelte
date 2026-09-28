import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	let items = ['hello', 'world', 'bye'];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		Component($$renderer, { item });
	}

	$$renderer.push(`<!--]--> <button>set null</button> <button>set object</button>`);
}