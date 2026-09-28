import * as $ from 'svelte/internal/server';
import { PhoneInput, Label, Dropdown, DropdownItem, Button } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";
import Usa from "$icons/Usa.svelte";
import Germany from "$icons/Germany.svelte";
import Italy from "$icons/Italy.svelte";
import China from "$icons/China.svelte";

export default function Advanced($$renderer) {
	$$renderer.push(`<form class="mx-auto max-w-sm"><div class="mt-2 flex"><button id="states-button" class="z-10 inline-flex shrink-0 items-center rounded-s-lg border border-r-0 border-gray-300 bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700" type="button">`);
	Usa($$renderer, {});
	$$renderer.push(`<!----> +1 `);
	ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6' });
	$$renderer.push(`<!----></button> `);

	Dropdown($$renderer, {
		simple: true,
		triggeredBy: '#states-button',
		children: ($$renderer) => {
			DropdownItem($$renderer, {
				class: 'flex items-center',
				children: ($$renderer) => {
					Usa($$renderer, {});
					$$renderer.push(`<!----> United States (+1)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				class: 'flex items-center',
				children: ($$renderer) => {
					Germany($$renderer, {});
					$$renderer.push(`<!----> Germany (+49)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				class: 'flex items-center',
				children: ($$renderer) => {
					Italy($$renderer, {});
					$$renderer.push(`<!----> Italy (+39)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				class: 'flex items-center',
				children: ($$renderer) => {
					China($$renderer, {});
					$$renderer.push(`<!----> China (+86)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Label($$renderer, {
		for: 'phone-input',
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Phone number:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	PhoneInput($$renderer, {
		phoneIcon: false,
		placeholder: '123-456-7890',
		required: true,
		phoneType: 'countryCode',
		classes: { input: "rounded-none border-r-0" }
	});

	$$renderer.push(`<!----> <label for="phone-input" class="sr-only">Phone number:</label> <button id="dropdown-verification-option-button" data-dropdown-toggle="dropdown-verification-option" class="z-10 inline-flex shrink-0 items-center rounded-e-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-900 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700" type="button">Send SMS <svg class="ms-2.5 h-2.5 w-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"></path></svg></button> `);

	Dropdown($$renderer, {
		simple: true,
		triggeredBy: '#dropdown-verification-option-button',
		children: ($$renderer) => {
			DropdownItem($$renderer, {
				class: 'flex items-center',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Send SMS`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				class: 'flex items-center',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Call`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Button($$renderer, {
		type: 'submit',
		class: 'mt-4 mb-2 w-full ',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Activate account`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form>`);
}