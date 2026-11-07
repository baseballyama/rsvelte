import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Thing from './Thing.svelte';

var root = $.from_html(`<button>Remove first thing</button> <!>`, 1);

export default function Each_block_without_key01_input($$anchor) {
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

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => things, $.index, ($$anchor, thing) => {
		Thing($$anchor, {
			get name() {
				return $.get(thing).name;
			}
		});
	});

	$.event('click', button, handleClick);
	$.append($$anchor, fragment);
}