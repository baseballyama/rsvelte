import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';

export default function Local_transitions_input($$renderer) {
	let showItems = true;
	let i = 5;

	let items = [
		'one',
		'two',
		'three',
		'four',
		'five',
		'six',
		'seven',
		'eight',
		'nine',
		'ten'
	];

	$$renderer.push(`<label><input type="checkbox"${$.attr('checked', showItems, true)}/> show list</label> <label><input type="range"${$.attr('value', i)} max="10"/></label> `);

	if (showItems) {
		$$renderer.push(`<!--[0--><!--[-->`);

		const each_array = $.ensure_array_like(items.slice(0, i));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div class="svelte-11ybl8">${$.escape(item)}</div>`);
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}