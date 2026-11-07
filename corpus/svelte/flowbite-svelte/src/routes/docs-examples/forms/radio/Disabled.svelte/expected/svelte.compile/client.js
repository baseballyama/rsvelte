import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Disabled($$anchor) {
	const binding_group = [];
	let selectedValue = $.state("2");
	var fragment = root();
	var node = $.first_child(fragment);

	Radio(node, {
		name: 'disabled-state',
		disabled: true,
		value: '1',
		get group() {
			return $.get(selectedValue);
		},

		set group($$value) {
			$.set(selectedValue, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Disabled radio');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Radio(node_1, {
		name: 'disabled-state',
		disabled: true,
		value: '2',
		get group() {
			return $.get(selectedValue);
		},

		set group($$value) {
			$.set(selectedValue, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Disabled checked');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}