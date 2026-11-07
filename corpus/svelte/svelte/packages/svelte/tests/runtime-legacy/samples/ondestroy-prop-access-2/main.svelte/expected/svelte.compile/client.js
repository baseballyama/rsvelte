import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<button>Reset value</button> <!>`, 1);

export default function Main($$anchor) {
	let value = { foo: 'bar' };
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			Component($$anchor, {
				get my_prop() {
					return value;
				}
			});
		};

		$.if(node, ($$render) => {
			if (value !== undefined) $$render(consequent);
		});
	}

	$.delegated('click', button, () => {
		value = undefined;
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);