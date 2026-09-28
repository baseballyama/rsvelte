import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let uid = 0;

	/** @type {Array<{ id: number }>} */
	let items = [];

	$$renderer.push(`<button>unshift</button> <!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		Child($$renderer, {});
	}

	$$renderer.push(`<!--]-->`);
}