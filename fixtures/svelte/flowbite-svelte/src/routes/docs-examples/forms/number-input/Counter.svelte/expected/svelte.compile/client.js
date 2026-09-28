import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input, Label, Button } from "flowbite-svelte";
import { PlusOutline, MinusOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<form class="mx-auto max-w-xs"><!> <div class="relative flex items-center gap-2"><!> <!> <!></div></form>`);

export default function Counter($$anchor, $$props) {
	$.push($$props, true);

	let counterInput = $.state(12);

	$.user_effect(() => {
		$.set(counterInput, Math.max(1, $.get(counterInput)), true);
	});

	var form = root();
	var node = $.child(form);

	Label(node, {
		for: 'counter-input',
		class: 'mb-1 text-sm text-gray-900 dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Choose quantity:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
		color: 'alternative',
		class: 'h-5 w-5 rounded-xl p-2',
		onclick: () => $.set(counterInput, $.get(counterInput) - 1),
		children: ($$anchor, $$slotProps) => {
			MinusOutline($$anchor, { class: 'h-2.5 w-2.5' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Input(node_2, {
		id: 'counter-input',
		type: 'number',
		class: 'w-12! shrink-0 border-0 bg-transparent p-0 text-center dark:bg-transparent',
		placeholder: '',
		required: true,
		get value() {
			return $.get(counterInput);
		},

		set value($$value) {
			$.set(counterInput, $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		color: 'alternative',
		class: 'h-5 w-5 rounded-xl p-2',
		onclick: () => $.set(counterInput, $.get(counterInput) + 1),
		children: ($$anchor, $$slotProps) => {
			PlusOutline($$anchor, { class: 'h-2.5 w-2.5' });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(form);
	$.append($$anchor, form);
	$.pop();
}