import * as $ from 'svelte/internal/server';
import { Input, Label, Helper } from "flowbite-svelte";

export default function HelperText($$renderer) {
	Label($$renderer, {
		class: 'flex flex-col gap-2',
		children: ($$renderer) => {
			$$renderer.push(`<span>Your email</span> `);

			Input($$renderer, {
				id: 'email',
				name: 'email',
				required: true,
				placeholder: 'name@flowbite.com'
			});

			$$renderer.push(`<!----> `);

			Helper($$renderer, {
				class: 'text-sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->We’ll never share your details. Read our <a href="/" class="text-primary-600 dark:text-primary-500 font-medium hover:underline">Privacy Policy</a> .`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}