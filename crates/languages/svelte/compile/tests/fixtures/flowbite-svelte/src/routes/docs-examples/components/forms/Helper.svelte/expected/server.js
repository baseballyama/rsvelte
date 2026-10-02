import * as $ from 'svelte/internal/server';
import { Label, Input, Helper } from "flowbite-svelte";

export default function Helper_1($$renderer) {
	Label($$renderer, {
		class: 'mb-2 block',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Your email`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		id: 'email',
		name: 'email',
		required: true,
		placeholder: 'name@flowbite.com'
	});

	$$renderer.push(`<!----> `);

	Helper($$renderer, {
		class: 'mt-2 text-sm',
		children: ($$renderer) => {
			$$renderer.push(`<!---->We’ll never share your details. Read our <a href="/" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Privacy Policy</a> .`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}