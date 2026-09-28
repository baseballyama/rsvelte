import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	PhoneInput,
	Label,
	Dropdown,
	DropdownItem,
	Button,
	Input,
	Checkbox,
	A
} from "flowbite-svelte";

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
var root_5 = $.from_html(`I accept the <!>`, 1);
var root_6 = $.from_html(`<form class="mx-auto max-w-sm"><!> <div class="flex"><button id="states-button" class="z-10 inline-flex shrink-0 items-center rounded-s-lg border border-r-0 border-gray-300 bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700" type="button"><!> +1 <!></button> <!> <!> <div class="relative w-full"><!></div></div> <div class="mt-4"><!> <!></div> <div class="mt-4 mb-4 flex items-center"><!> <!></div> <!></form>`);

export default function Authentication($$anchor) {
	var form = root_6();
	var node = $.child(form);

	Label(node, {
		for: 'phone-input',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Phone number:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var button = $.child(div);
	var node_1 = $.child(button);

	Usa(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	ChevronDownOutline(node_2, { class: 'ms-2 h-6 w-6' });
	$.reset(button);

	var node_3 = $.sibling(button, 2);

	Dropdown(node_3, {
		simple: true,
		triggeredBy: '#states-button',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_4();
			var node_4 = $.first_child(fragment);

			DropdownItem(node_4, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_5 = $.first_child(fragment_1);

					Usa(node_5, {});
					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			DropdownItem(node_6, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_7 = $.first_child(fragment_2);

					Germany(node_7, {});
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_6, 2);

			DropdownItem(node_8, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_9 = $.first_child(fragment_3);

					Italy(node_9, {});
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_8, 2);

			DropdownItem(node_10, {
				class: 'flex items-center',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_11 = $.first_child(fragment_4);

					China(node_11, {});
					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_3, 2);

	Label(node_12, {
		for: 'phone-input',
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Phone number:');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node_12, 2);
	var node_13 = $.child(div_1);

	PhoneInput(node_13, {
		phoneIcon: false,
		placeholder: '123-456-7890',
		required: true,
		phoneType: 'countryCode'
	});

	$.reset(div_1);
	$.reset(div);

	var div_2 = $.sibling(div, 2);
	var node_14 = $.child(div_2);

	Label(node_14, {
		for: 'password',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Your password');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Input(node_15, {
		type: 'password',
		name: 'password',
		id: 'password',
		placeholder: '••••••••',
		required: true
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_16 = $.child(div_3);

	Checkbox(node_16, {
		id: 'terms',
		'aria-describedby': 'terms',
		class: 'h-4 w-4',
		required: true
	});

	var node_17 = $.sibling(node_16, 2);

	Label(node_17, {
		for: 'terms',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_5 = root_5();
			var node_18 = $.sibling($.first_child(fragment_5));

			A(node_18, {
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Terms and Conditions');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var node_19 = $.sibling(div_3, 2);

	Button(node_19, {
		type: 'submit',
		class: 'mb-2 w-full',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Sign Up');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.append($$anchor, form);
}