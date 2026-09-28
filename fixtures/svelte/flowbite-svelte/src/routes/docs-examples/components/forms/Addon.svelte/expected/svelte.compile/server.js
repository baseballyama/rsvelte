import * as $ from 'svelte/internal/server';
import { Label, Input, InputAddon, ButtonGroup } from "flowbite-svelte";
import { UserCircleSolid } from "flowbite-svelte-icons";

export default function Addon($$renderer) {
	$$renderer.push(`<div class="mb-6">`);

	Label($$renderer, {
		for: 'website-admin',
		class: 'mb-2 block',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Username`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ButtonGroup($$renderer, {
		class: 'w-full',
		children: ($$renderer) => {
			InputAddon($$renderer, {
				children: ($$renderer) => {
					UserCircleSolid($$renderer, { class: 'h-4 w-4 text-gray-500 dark:text-gray-400' });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);
			Input($$renderer, { id: 'website-admin', placeholder: 'johndoe' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}