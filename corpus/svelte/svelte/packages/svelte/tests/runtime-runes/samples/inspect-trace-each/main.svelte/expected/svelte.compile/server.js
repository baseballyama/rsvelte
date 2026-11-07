import * as $ from 'svelte/internal/server';
import Entry from './Entry.svelte';

export default function Main($$renderer) {
	let array = [{ id: 1, hi: true }];

	$$renderer.push(`<button>update</button> <!--[-->`);

	const each_array = $.ensure_array_like(array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let entry = each_array[$$index];

		Entry($$renderer, { entry });
	}

	$$renderer.push(`<!--]-->`);
}