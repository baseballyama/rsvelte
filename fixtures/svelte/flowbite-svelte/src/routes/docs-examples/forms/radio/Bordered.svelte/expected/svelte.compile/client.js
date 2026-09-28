import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio } from "flowbite-svelte";

var root = $.from_html(`<div class="grid grid-cols-2 gap-6"><div class="rounded-sm border border-gray-200 dark:border-gray-700"><!></div> <div class="rounded-sm border border-gray-200 dark:border-gray-700"><!></div></div>`);

export default function Bordered($$anchor) {
	const binding_group = [];
	let selectedValue3 = $.state("2");
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Radio(node, {
		name: 'bordered',
		value: '1',
		classes: { label: "w-full p-4" },
		get group() {
			return $.get(selectedValue3);
		},

		set group($$value) {
			$.set(selectedValue3, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default radio');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Radio(node_1, {
		name: 'bordered',
		value: '2',
		classes: { label: "w-full p-4" },
		get group() {
			return $.get(selectedValue3);
		},

		set group($$value) {
			$.set(selectedValue3, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Checked state');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}