import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";

export default function Solid($$renderer) {
	Breadcrumb($$renderer, {
		'aria-label': 'Solid background breadcrumb example',
		solid: true,
		children: ($$renderer) => {
			BreadcrumbItem($$renderer, {
				href: '/',
				home: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Home`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BreadcrumbItem($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Projects`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BreadcrumbItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Flowbite Svelte`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}