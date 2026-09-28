import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
import { HomeOutline, ChevronDoubleRightOutline } from "flowbite-svelte-icons";

export default function Icons($$renderer) {
	Breadcrumb($$renderer, {
		'aria-label': 'Solid background breadcrumb example',
		class: 'bg-gray-50 px-5 py-3 dark:bg-gray-900',
		children: ($$renderer) => {
			{
				function icon($$renderer) {
					HomeOutline($$renderer, { class: 'me-2 h-4 w-4' });
				}

				BreadcrumbItem($$renderer, {
					href: '/',
					home: true,
					icon,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Home`);
					},
					$$slots: { icon: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function icon($$renderer) {
					ChevronDoubleRightOutline($$renderer, { class: 'mx-2 h-5 w-5 dark:text-white' });
				}

				BreadcrumbItem($$renderer, {
					href: '/',
					icon,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Projects`);
					},
					$$slots: { icon: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function icon($$renderer) {
					ChevronDoubleRightOutline($$renderer, { class: 'mx-2 h-5 w-5 dark:text-white' });
				}

				BreadcrumbItem($$renderer, {
					icon,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Flowbite Svelte`);
					},
					$$slots: { icon: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}