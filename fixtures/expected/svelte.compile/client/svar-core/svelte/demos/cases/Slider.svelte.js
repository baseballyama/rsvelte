import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Slider } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3>Slider</h3> <!> <!> <!> <!> <!></div>`);

export default function Slider_1($$anchor) {
	let valueA = $.state(50);
	let valueB = $.state(50);
	let valueC = $.state(50);

	function onInput({ input, value, previous }) {
		if (input) {
			console.log(`Input change from ${previous} to ${value}`);
			$.set(valueB, value, true);
		}
	}

	function onChange({ input, value, previous }) {
		if (!input) {
			console.log(`Final input change from ${previous} to ${value}`);
			$.set(valueC, value, true);
		}
	}

	var div = root();
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'Updates from binding',
		position: 'left',
		type: 'slider',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, {
				get label() {
					return `Progress: ${$.get(valueA) ?? ''}%`;
				},

				get value() {
					return $.get(valueA);
				},

				set value($$value) {
					$.set(valueA, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Updates from input `change` event',
		position: 'left',
		type: 'slider',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, {
				get label() {
					return `Progress: ${$.get(valueB) ?? ''}%`;
				},

				get value() {
					return $.get(valueB);
				},
				onchange: onInput
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Updates from `change` event',
		position: 'left',
		type: 'slider',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, {
				get label() {
					return `Progress: ${$.get(valueC) ?? ''}%`;
				},

				get value() {
					return $.get(valueC);
				},
				onchange: onChange
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Disabled',
		position: 'left',
		type: 'slider',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, { disabled: true, value: 20 });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Unset value',
		position: 'left',
		type: 'slider',
		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, { title: 'Default slider\'s value is 0' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}