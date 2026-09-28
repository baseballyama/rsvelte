import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, Label } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Underline($$anchor) {
	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		for: 'select-underline',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Underline select');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Select(node_1, {
		id: 'select-underline',
		underline: true,
		class: 'mt-2',
		get items() {
			return countries;
		}
	});

	$.append($$anchor, fragment);
}