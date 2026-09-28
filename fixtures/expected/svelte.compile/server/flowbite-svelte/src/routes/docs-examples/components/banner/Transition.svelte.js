import * as $ from 'svelte/internal/server';
import { slide } from "svelte/transition";
import { quintOut } from "svelte/easing";
import { Banner, Skeleton, ImagePlaceholder, A } from "flowbite-svelte";
import { BullhornSolid } from "flowbite-svelte-icons";

export default function Transition($$renderer) {
	const params = { delay: 250, duration: 500, easing: quintOut };

	Skeleton($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);

	Banner($$renderer, {
		transition: slide,
		params,
		class: 'absolute',
		children: ($$renderer) => {
			$$renderer.push(`<p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400"><span class="me-3 inline-flex rounded-full bg-gray-200 p-1 dark:bg-gray-600">`);
			BullhornSolid($$renderer, { class: 'h-3 w-3 text-gray-500 dark:text-gray-400' });
			$$renderer.push(`<!----> <span class="sr-only">Light bulb</span></span> <span>New brand identity has been launched for the `);

			A($$renderer, {
				href: 'https://flowbite.com',
				class: 'font-medium underline decoration-solid decoration-2 underline-offset-2 hover:no-underline dark:decoration-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Flowbite Library`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></span></p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}