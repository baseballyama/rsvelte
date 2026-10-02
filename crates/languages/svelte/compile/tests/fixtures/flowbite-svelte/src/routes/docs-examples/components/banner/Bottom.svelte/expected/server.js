import * as $ from 'svelte/internal/server';
import { Banner, Skeleton, ImagePlaceholder, A } from "flowbite-svelte";
import { SalePercentSolid, ArrowRightOutline } from "flowbite-svelte-icons";

export default function Bottom($$renderer) {
	Skeleton($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);
	ImagePlaceholder($$renderer, { class: 'py-4' });
	$$renderer.push(`<!----> `);

	Banner($$renderer, {
		type: 'bottom',
		class: 'absolute',
		children: ($$renderer) => {
			$$renderer.push(`<p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400"><span class="me-3 inline-flex rounded-full bg-gray-200 p-1 dark:bg-gray-600">`);
			SalePercentSolid($$renderer, { class: 'h-4 w-4 text-gray-500 dark:text-gray-400' });
			$$renderer.push(`<!----> <span class="sr-only">Discount coupon</span></span> <span>Get 5% commission per sale `);

			A($$renderer, {
				href: 'https://flowbite.com',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Become a partner `);
					ArrowRightOutline($$renderer, { class: 'ms-2 h-3 w-3' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></span></p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}