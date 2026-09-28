import * as $ from 'svelte/internal/server';
import { Banner, Skeleton, ImagePlaceholder, Button } from "flowbite-svelte";
import { BookOpenOutline, ArrowRightOutline } from "flowbite-svelte-icons";

export default function Informational($$renderer) {
	Skeleton($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);

	Banner($$renderer, {
		class: 'absolute',
		children: ($$renderer) => {
			$$renderer.push(`<div class="mb-4 md:me-4 md:mb-0"><h2 class="mb-1 text-base font-semibold text-gray-900 dark:text-white">Integration is the key</h2> <p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">You can integrate Flowbite with many tools to make your work even more efficient and lightning fast based on Tailwind CSS.</p></div> <div class="flex shrink-0 items-center gap-3">`);

			Button($$renderer, {
				href: '/',
				size: 'sm',
				color: 'alternative',
				children: ($$renderer) => {
					BookOpenOutline($$renderer, { class: 'me-2 h-3 w-3' });
					$$renderer.push(`<!----> Learn more`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				href: '/',
				size: 'sm',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Get started `);
					ArrowRightOutline($$renderer, { class: 'ms-2 h-3 w-3' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}