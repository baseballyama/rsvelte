import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label, P, Button, ButtonGroup } from "flowbite-svelte";
import { PlusOutline, MinusOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<form class="mx-auto max-w-xs"><!> <div class="relative flex max-w-[14rem] items-center"><!></div> <!></form>`);

export default function Control($$anchor) {
	let quantity = $.state(12345);
	var form = root_1();
	var node = $.child(form);

	Label(node, {
		class: 'mb-2 text-sm',
		for: 'quantity-input',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Choose quantity:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	ButtonGroup(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Button(node_2, {
				type: 'button',
				id: 'decrement-button',
				onclick: () => $.set(quantity, $.get(quantity) - 1),
				children: ($$anchor, $$slotProps) => {
					MinusOutline($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, {
				type: 'number',
				id: 'quantity-input',
				'aria-describedby': 'helper-text-explanation',
				placeholder: '999',
				required: true,
				class: 'w-32! text-center',
				get value() {
					return $.get(quantity);
				},

				set value($$value) {
					$.set(quantity, $$value, true);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				type: 'button',
				id: 'increment-button',
				onclick: () => $.set(quantity, $.get(quantity) + 1),
				children: ($$anchor, $$slotProps) => {
					PlusOutline($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	P(node_5, {
		id: 'helper-text-explanation',
		class: 'mt-2 text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Please select a 5 digit number from 0 to 9.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}