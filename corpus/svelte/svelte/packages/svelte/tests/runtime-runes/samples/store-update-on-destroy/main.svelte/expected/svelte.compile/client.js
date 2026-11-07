import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import Test from './Test.svelte';

var root = $.from_html(`<input type="checkbox"/> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let store = writable(0);
	let checked = $.state(true);
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			Test($$anchor, {
				get store() {
					return store;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(checked)) $$render(consequent);
		});
	}

	$.bind_checked(input, () => $.get(checked), ($$value) => $.set(checked, $$value));
	$.append($$anchor, fragment);
	$.pop();
}