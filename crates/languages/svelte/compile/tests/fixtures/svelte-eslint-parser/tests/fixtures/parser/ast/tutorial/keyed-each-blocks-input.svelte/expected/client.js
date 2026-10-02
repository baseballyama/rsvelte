import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Thing from './Thing.svelte';

var root = $.from_html(`<button>Remove first thing</button> <!>`, 1);

export default function Keyed_each_blocks_input($$anchor) {
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

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => things, (thing) => thing.id, ($$anchor, thing) => {
		Thing($$anchor, {
			get current() {
				return $.get(thing).color;
			}
		});
	});

	$.event('click', button, handleClick);
	$.append($$anchor, fragment);
}