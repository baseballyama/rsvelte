import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, Label } from "flowbite-svelte";

var root = $.from_html(`Select an option <!>`, 1);

export default function Event($$anchor) {
	let countries = [
		{ value: "us", name: "United States" },
		{ value: "ca", name: "Canada" },
		{ value: "fr", name: "France" }
	];

	let eventSelected = $.state("");

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
				clearable: true,
				onClear: () => {
					alert("Clicked clear button!");
				},

				onchange: () => {
					console.log("Changed select value:");
				},

				get value() {
					return $.get(eventSelected);
				},

				set value($$value) {
					$.set(eventSelected, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}