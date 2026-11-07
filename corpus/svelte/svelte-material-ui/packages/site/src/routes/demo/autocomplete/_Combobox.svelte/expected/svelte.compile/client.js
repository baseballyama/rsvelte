import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Autocomplete from '@smui-extra/autocomplete';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<div><!> <pre class="status"> </pre> <div style="margin-top: 1em;"><div>Programmatically select:</div> <!> <!></div></div>`);

export default function _Combobox($$anchor) {
	let fruits = [
		'Apple',
		'Orange',
		'Banana',
		'Mango',
		'Lemon',
		'Cherry',
		'Blueberry',
		'Grape',
		'Strawberry'
	];

	let value = $.state(void 0);
	var div = root();
	var node = $.child(div);

	Autocomplete(node, {
		combobox: true,
		get options() {
			return fruits;
		},
		label: 'Fruit',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);
	var div_1 = $.sibling(pre, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Button(node_1, {
		onclick: () => $.set(value, 'Dragonfruit'),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Dragonfruit');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => $.set(value, 'Elderberry'),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Elderberry');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `Selected: ${($.get(value) || '') ?? ''}`));
	$.append($$anchor, div);
}