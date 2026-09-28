import * as $ from 'svelte/internal/server';
import Breadcrumb from "carbon-components-svelte/Breadcrumb/Breadcrumb.svelte";
import BreadcrumbItem from "carbon-components-svelte/Breadcrumb/BreadcrumbItem.svelte";

export default function Breadcrumb_ariaCurrent_test($$renderer) {
	Breadcrumb($$renderer, {
		children: ($$renderer) => {
			BreadcrumbItem($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dashboard`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BreadcrumbItem($$renderer, {
				href: '/reports',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Annual reports`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BreadcrumbItem($$renderer, {
				href: '/reports/2019',
				isCurrentPage: true,
				'aria-current': 'page',
				children: ($$renderer) => {
					$$renderer.push(`<!---->2019`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}