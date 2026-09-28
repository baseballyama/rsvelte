import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio } from "flowbite-svelte";

var root = $.from_html(`<div class="flex gap-3"><!> <!> <!> <!></div>`);

export default function Inline($$anchor) {
	const binding_group = [];
	let inline1 = $.state("second");
	var div = root();
	var node = $.child(div);

	Radio(node, {
		value: 'first',
		get group() {
			return $.get(inline1);
		},

		set group($$value) {
			$.set(inline1, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Inline 1');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Radio(node_1, {
		value: 'second',
		get group() {
			return $.get(inline1);
		},

		set group($$value) {
			$.set(inline1, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Inline 2 checked');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Radio(node_2, {
		value: 'third',
		get group() {
			return $.get(inline1);
		},

		set group($$value) {
			$.set(inline1, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Inline 3');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Radio(node_3, {
		value: 'fourth',
		disabled: true,
		get group() {
			return $.get(inline1);
		},

		set group($$value) {
			$.set(inline1, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Inline disabled');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}