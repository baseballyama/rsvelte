import * as $ from 'svelte/internal/server';
import Thing from './Thing.svelte';

export default function Each_block_without_key01_input($$renderer) {
	let things = [
		{ id: 1, name: 'apple' },
		{ id: 2, name: 'banana' },
		{ id: 3, name: 'carrot' },
		{ id: 4, name: 'doughnut' },
		{ id: 5, name: 'egg' }
	];

	function handleClick() {
		things = things.slice(1);
	}

	$$renderer.push(`<button>Remove first thing</button> <!--[-->`);

	const each_array = $.ensure_array_like(things);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let thing = each_array[$$index];

		Thing($$renderer, { name: thing.name });
	}

	$$renderer.push(`<!--]-->`);
}