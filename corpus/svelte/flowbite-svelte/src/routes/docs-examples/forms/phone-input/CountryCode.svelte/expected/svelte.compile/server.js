import * as $ from 'svelte/internal/server';
import { PhoneInput, Label, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";
import Usa from "$icons/Usa.svelte";
import Germany from "$icons/Germany.svelte";
import Italy from "$icons/Italy.svelte";
import China from "$icons/China.svelte";

export default function CountryCode($$renderer) {
	$$renderer.push(`<form class="mx-auto max-w-sm"><div class="flex"><button id="states-button" class="z-10 inline-flex shrink-0 items-center rounded-s-lg border border-r-0 border-gray-300 bg-gray-100 px-3 py-2 text-center text-sm font-medium text-gray-500 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 focus:outline-hidden dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-700" type="button">`);
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

	$$renderer.push(`<!----> <div class="relative w-full">`);

	PhoneInput($$renderer, {
		phoneIcon: false,
		placeholder: '123-456-7890',
		required: true,
		phoneType: 'countryCode'
	});

	$$renderer.push(`<!----></div></div></form>`);
}