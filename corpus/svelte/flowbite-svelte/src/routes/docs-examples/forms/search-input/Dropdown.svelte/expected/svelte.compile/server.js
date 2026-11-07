import * as $ from 'svelte/internal/server';
import { Search, Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { SearchOutline, ChevronDownOutline } from "flowbite-svelte-icons";

export default function Dropdown_1($$renderer) {
	const items = [
		{ label: "All categories" },
		{ label: "Mockups" },
		{ label: "Templates" },
		{ label: "Design" },
		{ label: "Logos" }
	];

	let selectCategory = "All categories";

	$$renderer.push(`<form class="flex"><div class="relative">`);

	Button($$renderer, {
		class: 'border-primary-700 rounded-e-none border border-e-0 whitespace-nowrap',
		children: ($$renderer) => {
			$$renderer.push(`<!---->${$.escape(selectCategory)} `);
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

			const each_array = $.ensure_array_like(items);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { label } = each_array[$$index];

				DropdownItem($$renderer, {
					onclick: () => {
						selectCategory = label;
					},
					class: selectCategory === label ? "underline" : "",
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(label)}`);
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