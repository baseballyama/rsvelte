import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	let items = [1];

	function add() {
		items = [1];
	}

	function remove() {
		items = [];
	}

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		Child($$renderer, {});
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { add, remove });
}