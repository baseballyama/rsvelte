import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label, P, Button, ButtonGroup } from "flowbite-svelte";
import { PlusOutline, MinusOutline, HomeOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <div class="absolute start-1/2 bottom-1 flex -translate-x-1/2 items-center space-x-1 text-xs text-gray-400 rtl:translate-x-1/2 rtl:space-x-reverse"><!> <span>Bedrooms</span></div> <!>`, 1);
var root_1 = $.from_html(`<form class="mx-auto max-w-xs"><!> <!> <!></form>`);

export default function ControlIcon($$anchor, $$props) {
	$.push($$props, true);

	let bedroom = $.state(3);

	$.user_effect(() => {
		$.set(bedroom, Math.min(5, Math.max(1, $.get(bedroom))), true);
	});

	var form = root_1();
	var node = $.child(form);

	Label(node, {
		class: 'mb-2 text-sm',
		for: 'quantity_input',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Choose quantity:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ButtonGroup(node_1, {
		class: 'relative',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Button(node_2, {
				type: 'button',
				onclick: () => $.set(bedroom, $.get(bedroom) - 1),
				class: 'h-11 p-3',
				children: ($$anchor, $$slotProps) => {
					MinusOutline($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, {
				min: '1',
				max: '5',
				type: 'number',
				id: 'quantity_input',
				'aria-describedby': 'helper-text-explanation',
				placeholder: ' ',
				required: true,
				class: 'h-11 w-40! pb-6 text-center',
				get value() {
					return $.get(bedroom);
				},

				set value($$value) {
					$.set(bedroom, $$value, true);
				}
			});

			var div = $.sibling(node_3, 2);
			var node_4 = $.child(div);

			HomeOutline(node_4, { class: 'h-4 w-4' });
			$.next(2);
			$.reset(div);

			var node_5 = $.sibling(div, 2);

			Button(node_5, {
				type: 'button',
				onclick: () => $.set(bedroom, $.get(bedroom) + 1),
				class: 'h-11 p-3',
				children: ($$anchor, $$slotProps) => {
					PlusOutline($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_1, 2);

	P(node_6, {
		id: 'helper-text-explanation',
		class: 'mt-2 text-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Please select the number of bedrooms.');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
	$.pop();
}