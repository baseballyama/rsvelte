import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from 'svelte/transition';

var root = $.from_html(`<div class="svelte-11ybl8"> </div>`);
var root_1 = $.from_html(`<label><input type="checkbox"/> show list</label> <label><input type="range" max="10"/></label> <!>`, 1);

export default function Local_transitions_input($$anchor) {
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

	var fragment = root_1();
	var label = $.first_child(fragment);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.reset(label_1);

	var node = $.sibling(label_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => items.slice(0, i), $.index, ($$anchor, item) => {
				var div = root();
				var text = $.only_child(div, true);

				$.template_effect(() => $.set_text(text, $.get(item)));
				$.transition(3, div, () => slide);
				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (showItems) $$render(consequent);
		});
	}

	$.bind_checked(input, () => showItems, ($$value) => showItems = $$value);
	$.bind_value(input_1, () => i, ($$value) => i = $$value);
	$.append($$anchor, fragment);
}