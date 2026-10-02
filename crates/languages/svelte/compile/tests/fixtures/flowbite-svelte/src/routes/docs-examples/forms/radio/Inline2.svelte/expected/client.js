import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Inline2($$anchor) {
	const binding_group = [];
	let inline2 = $.state("third");
	var fragment = root();
	var node = $.first_child(fragment);

	Radio(node, {
		inline: true,
		value: 'first',
		class: 'me-2',
		get group() {
			return $.get(inline2);
		},

		set group($$value) {
			$.set(inline2, $$value, true);
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
		inline: true,
		value: 'second',
		class: 'me-2',
		get group() {
			return $.get(inline2);
		},

		set group($$value) {
			$.set(inline2, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Inline 2');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Radio(node_2, {
		inline: true,
		value: 'third',
		class: 'me-2',
		get group() {
			return $.get(inline2);
		},

		set group($$value) {
			$.set(inline2, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Inline checked');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Radio(node_3, {
		inline: true,
		value: 'fourth',
		class: 'me-2',
		disabled: true,
		get group() {
			return $.get(inline2);
		},

		set group($$value) {
			$.set(inline2, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Inline disabled');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}