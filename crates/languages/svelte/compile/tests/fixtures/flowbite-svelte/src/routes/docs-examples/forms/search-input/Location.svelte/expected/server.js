import * as $ from 'svelte/internal/server';
import { Search, Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { SearchOutline, ChevronDownOutline } from "flowbite-svelte-icons";

export default function Location($$renderer) {
	const countries = [
		{
			label: "United States",
			labelSelected: "USA",
			icon: "/images/forms/search-input/usa-flag.svg"
		},

		{
			label: "Germany",
			labelSelected: "DE",
			icon: "/images/forms/search-input/de-flag.svg"
		},

		{
			label: "Italy",
			labelSelected: "ITA",
			icon: "/images/forms/search-input/it-flag.svg"
		},

		{
			label: "China",
			labelSelected: "CH",
			icon: "/images/forms/search-input/ch-flag.svg"
		}
	];

	let selectCountry = "USA";
	let buttonLabel = $.derived(() => countries.find(({ labelSelected }) => labelSelected === selectCountry));

	$$renderer.push(`<form class="flex"><div class="relative">`);

	Button($$renderer, {
		class: 'border-primary-700 rounded-e-none border border-e-0 whitespace-nowrap',
		children: ($$renderer) => {
			$$renderer.push(`<img class="me-2 h-3.5 w-3.5 rounded-full"${$.attr('src', buttonLabel()?.icon)}${$.attr('alt', buttonLabel()?.label)}/> ${$.escape(buttonLabel()?.labelSelected)} `);
			ChevronDownOutline($$renderer, { class: 'ms-2.5 h-6 w-6' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		simple: true,
		class: 'w-40',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(countries);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let country = each_array[$$index];

				DropdownItem($$renderer, {
					onclick: () => {
						selectCountry = country.labelSelected;
					},
					class: `inline-flex items-center ${selectCountry === country.labelSelected ? 'underline' : ''}`,
					children: ($$renderer) => {
						$$renderer.push(`<img class="me-2 h-3.5 w-3.5 rounded-full"${$.attr('src', country.icon)}${$.attr('alt', country.label)}/> ${$.escape(country.label)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> `);

	Search($$renderer, {
		size: 'lg',
		classes: { input: "rounded-none py-2.5" },
		placeholder: 'Search Mockups, Logos, Design Templates...'
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		class: 'rounded-s-none p-2!',
		children: ($$renderer) => {
			SearchOutline($$renderer, { class: 'h-6 w-6' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></form>`);
}