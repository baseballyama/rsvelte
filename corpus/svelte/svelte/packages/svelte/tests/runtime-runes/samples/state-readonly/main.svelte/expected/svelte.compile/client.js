import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<button></button> <!>`, 1);

export default function Main($$anchor) {
	let state = $.state(void 0);
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Component($$anchor, {
				get state() {
					return $.get(state);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(state)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => {
		$.set(state, {}, true);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);