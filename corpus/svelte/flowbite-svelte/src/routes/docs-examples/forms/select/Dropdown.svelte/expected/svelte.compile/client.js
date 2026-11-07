import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, Button, ButtonGroup, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";
import Usa from "$icons/Usa.svelte";
import Germany from "$icons/Germany.svelte";
import Italy from "$icons/Italy.svelte";
import China from "$icons/China.svelte";

var root = $.from_html(`<!> USA <!>`, 1);
var root_1 = $.from_html(`<!> United States`, 1);
var root_2 = $.from_html(`<!> Germany`, 1);
var root_3 = $.from_html(`<!> Italy`, 1);
var root_4 = $.from_html(`<!> China`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function Dropdown_1($$anchor) {
	let states = [
		{ value: "CA", name: "California" },
		{ value: "TX", name: "Texas" },
		{ value: "WH", name: "Washinghton" },
		{ value: "FL", name: "Florida" },
		{ value: "VG", name: "Virginia" },
		{ value: "GE", name: "Georgia" },
		{ value: "MI", name: "Michigan" }
	];

	ButtonGroup($$anchor, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var node = $.first_child(fragment_1);

			Button(node, {
				class: 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-500 focus:ring-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Usa(node_1, {});

					var node_2 = $.sibling(node_1, 2);

					ChevronDownOutline(node_2, { class: 'ms-2 h-6 w-6' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			Dropdown(node_3, {
				simple: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_5();
					var node_4 = $.first_child(fragment_3);

					DropdownItem(node_4, {
						class: 'flex items-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_5 = $.first_child(fragment_4);

							Usa(node_5, {});
							$.next();
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_4, 2);

					DropdownItem(node_6, {
						class: 'flex items-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_7 = $.first_child(fragment_5);

							Germany(node_7, {});
							$.next();
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_6, 2);

					DropdownItem(node_8, {
						class: 'flex items-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_3();
							var node_9 = $.first_child(fragment_6);

							Italy(node_9, {});
							$.next();
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_8, 2);

					DropdownItem(node_10, {
						class: 'flex items-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_4();
							var node_11 = $.first_child(fragment_7);

							China(node_11, {});
							$.next();
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_3, 2);

			Select(node_12, {
				get items() {
					return states;
				},
				placeholder: 'Choose the state'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}