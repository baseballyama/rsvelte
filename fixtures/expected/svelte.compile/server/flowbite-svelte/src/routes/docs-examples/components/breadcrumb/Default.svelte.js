import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";

export default function Default($$renderer) {
	Breadcrumb($$renderer, {
		'aria-label': 'Default breadcrumb example',
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