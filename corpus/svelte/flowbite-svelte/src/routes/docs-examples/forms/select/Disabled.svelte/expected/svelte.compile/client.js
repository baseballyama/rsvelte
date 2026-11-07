import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Disabled($$anchor) {
	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		for: 'select-disabled',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Disabled select');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Select(node_1, {
		id: 'select-disabled',
		disabled: true,
		get items() {
			return countries;
		},
		placeholder: 'You can\'t select anything...'
	});

	$.append($$anchor, fragment);
}