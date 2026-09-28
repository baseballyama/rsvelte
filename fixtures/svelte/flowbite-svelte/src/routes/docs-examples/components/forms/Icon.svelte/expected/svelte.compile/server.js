import * as $ from 'svelte/internal/server';
import { Label, Input } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	$$renderer.push(`<div class="mb-6">`);

	Label($$renderer, {
		for: 'input-group-1',
		class: 'mb-2 block',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your Email`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function left($$renderer) {
			EnvelopeSolid($$renderer, { class: 'h-5 w-5 text-gray-500 dark:text-gray-400' });
		}

		Input($$renderer, {
			id: 'email',
			type: 'email',
			placeholder: 'name@flowbite.com',
			class: 'pl-8',
			left,
			$$slots: { left: true }
		});
	}

	$$renderer.push(`<!----></div>`);
}