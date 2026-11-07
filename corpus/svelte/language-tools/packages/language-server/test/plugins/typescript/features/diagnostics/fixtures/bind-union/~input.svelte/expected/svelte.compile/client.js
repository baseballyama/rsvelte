import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<input type="checkbox"/> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	let checked = false;
	let value = 'foo';
	var fragment = root();
	var input = $.first_child(fragment);

	$.remove_input_defaults(input);

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var text = $.text('checked');

			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if (checked === true) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_1 = $.text('bar');

			$.append($$anchor, text_1);
		};

		$.if(node_1, ($$render) => {
			if (value === 'bar') $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	Component(node_2, {
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	$.bind_checked(input, () => checked, ($$value) => checked = $$value);
	$.append($$anchor, fragment);
}