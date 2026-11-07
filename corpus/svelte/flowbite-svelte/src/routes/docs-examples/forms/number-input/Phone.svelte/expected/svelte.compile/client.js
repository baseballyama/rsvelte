import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PhoneInput, Label, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";
import Usa from "$icons/Usa.svelte";
import Germany from "$icons/Germany.svelte";
import Italy from "$icons/Italy.svelte";
import China from "$icons/China.svelte";

var root = $.from_html(`<!> United States (+1)`, 1);
var root_1 = $.from_html(`<!> Germany (+49)`, 1);
var root_2 = $.from_html(`<!> Italy (+39)`, 1);
var root_3 = $.from_html(`<!> China (+86)`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<form class="mx-auto max-w-sm"><div class="flex items-center"><button id="states-button" class="z-10 inline-flex shrink-0 items-center rounded-s-lg border border-r-0 border-gray-300 bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700" type="button"><!> +1 <!></button> <!> <!> <div class="relative w-full"><!></div></div></form>`);

export default function Phone($$anchor) {
	var form = root_5();
	var div = $.child(form);
	var button = $.child(div);
	var node = $.child(button);

	Usa(node, {});

	var node_1 = $.sibling(node, 2);

	ChevronDownOutline(node_1, { class: 'ms-2 h-6 w-6' });
	$.reset(button);

	var node_2 = $.sibling(button, 2);

	Dropdown(node_2, {
		simple: true,
		triggeredBy: '#states-button',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var node_3 = $.first_child(fragment);

			DropdownItem(node_3, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_4 = $.first_child(fragment_1);

					Usa(node_4, {});
					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_3, 2);

			DropdownItem(node_5, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_6 = $.first_child(fragment_2);

					Germany(node_6, {});
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			DropdownItem(node_7, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_8 = $.first_child(fragment_3);

					Italy(node_8, {});
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_7, 2);

			DropdownItem(node_9, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_10 = $.first_child(fragment_4);

					China(node_10, {});
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_2, 2);

	Label(node_11, {
		for: 'phone-input',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Phone number:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_11, 2);
	var node_12 = $.child(div_1);

	PhoneInput(node_12, {
		phoneIcon: false,
		placeholder: '123-456-7890',
		required: true,
		phoneType: 'countryCode'
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(form);
	$.append($$anchor, form);
}