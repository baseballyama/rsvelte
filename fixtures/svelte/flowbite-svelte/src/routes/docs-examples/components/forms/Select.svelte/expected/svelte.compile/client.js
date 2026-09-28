import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Select } from "flowbite-svelte";

var root = $.from_html(`Select an option <!>`, 1);

export default function Select_1($$anchor) {
	let selected = "";

	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	Label($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1));

			Select(node, {
				class: 'mt-2',
				get items() {
					return countries;
				},

				get value() {
					return selected;
				},

				set value($$value) {
					selected = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}