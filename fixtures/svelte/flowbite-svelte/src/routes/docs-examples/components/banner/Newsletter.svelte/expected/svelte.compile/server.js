import * as $ from 'svelte/internal/server';
import { Banner, Skeleton, ImagePlaceholder, Input, Label, Button } from "flowbite-svelte";

export default function Newsletter($$renderer) {
	Skeleton($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);

	Banner($$renderer, {
		classes: { insideDiv: "w-full sm:w-auto" },
		class: 'absolute',
		children: ($$renderer) => {
			$$renderer.push(`<form action="/" class="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-4">`);

			Label($$renderer, {
				for: 'email',
				class: 'shrink-0 text-gray-500 dark:text-gray-400',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sign up for our newsletter`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'email',
				id: 'email',
				placeholder: 'Enter your email',
				class: 'bg-white md:w-64 dark:border-gray-500 dark:bg-gray-600',
				required: true
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				type: 'submit',
				class: 'w-full sm:w-auto',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Subscribe`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></form>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}