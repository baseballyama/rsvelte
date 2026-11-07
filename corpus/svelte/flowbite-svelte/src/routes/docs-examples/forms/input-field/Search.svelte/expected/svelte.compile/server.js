import * as $ from 'svelte/internal/server';
import { Input, Label, Button } from "flowbite-svelte";
import { SearchOutline } from "flowbite-svelte-icons";

export default function Search($$renderer) {
	$$renderer.push(`<form>`);

	Label($$renderer, {
		for: 'search',
		class: 'mb-2 block',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your Email`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function left($$renderer) {
			SearchOutline($$renderer, { class: 'h-6 w-6 text-gray-500 dark:text-gray-400' });
		}

		function right($$renderer) {
			Button($$renderer, {
				size: 'sm',
				type: 'submit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Search`);
				},
				$$slots: { default: true }
			});
		}

		Input($$renderer, {
			id: 'search',
			placeholder: 'Search',
			size: 'lg',
			class: 'ps-9',
			left,
			right,
			$$slots: { left: true, right: true }
		});
	}

	$$renderer.push(`<!----></form>`);
}