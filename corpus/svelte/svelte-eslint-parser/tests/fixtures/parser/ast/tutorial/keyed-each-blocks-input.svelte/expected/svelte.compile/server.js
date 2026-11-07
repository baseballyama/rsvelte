import * as $ from 'svelte/internal/server';
import Thing from './Thing.svelte';

export default function Keyed_each_blocks_input($$renderer) {
	let things = [
		{ id: 1, color: 'darkblue' },
		{ id: 2, color: 'indigo' },
		{ id: 3, color: 'deeppink' },
		{ id: 4, color: 'salmon' },
		{ id: 5, color: 'gold' }
	];

	function handleClick() {
		things = things.slice(1);
	}

	$$renderer.push(`<button>Remove first thing</button> <!--[-->`);

	const each_array = $.ensure_array_like(things);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let thing = each_array[$$index];

		Thing($$renderer, { current: thing.color });
	}

	$$renderer.push(`<!--]-->`);
}