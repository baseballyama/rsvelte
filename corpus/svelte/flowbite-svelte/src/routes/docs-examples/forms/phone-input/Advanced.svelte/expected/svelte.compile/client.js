import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PhoneInput, Label, Dropdown, DropdownItem, Button } from "flowbite-svelte";
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
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<form class="mx-auto max-w-sm"><div class="mt-2 flex"><button id="states-button" class="z-10 inline-flex shrink-0 items-center rounded-s-lg border border-r-0 border-gray-300 bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700" type="button"><!> +1 <!></button> <!> <!> <!> <label for="phone-input" class="sr-only">Phone number:</label> <button id="dropdown-verification-option-button" data-dropdown-toggle="dropdown-verification-option" class="z-10 inline-flex shrink-0 items-center rounded-e-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700" type="button">Send SMS <svg class="ms-2.5 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"></path></svg></button> <!></div> <!></form>`);

export default function Advanced($$anchor) {
	var form = root_6();
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

	var node_12 = $.sibling(node_11, 2);

	PhoneInput(node_12, {
		phoneIcon: false,
		placeholder: '123-456-7890',
		required: true,
		phoneType: 'countryCode',
		classes: { input: "rounded-none border-r-0" }
	});

	var node_13 = $.sibling(node_12, 6);

	Dropdown(node_13, {
		simple: true,
		triggeredBy: '#dropdown-verification-option-button',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_5();
			var node_14 = $.first_child(fragment_5);

			DropdownItem(node_14, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Send SMS');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			DropdownItem(node_15, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Call');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_16 = $.sibling(div, 2);

	Button(node_16, {
		type: 'submit',
		class: 'mt-4 mb-2 w-full ',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Activate account');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}