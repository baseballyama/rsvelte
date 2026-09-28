import * as $ from 'svelte/internal/server';
import Breadcrumb from "carbon-components-svelte/Breadcrumb/Breadcrumb.svelte";
import BreadcrumbItem from "carbon-components-svelte/Breadcrumb/BreadcrumbItem.svelte";

export default function Breadcrumb_noTrailingSlash_test($$renderer) {
	Breadcrumb($$renderer, {
		noTrailingSlash: true,
		children: ($$renderer) => {
			BreadcrumbItem($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Home`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BreadcrumbItem($$renderer, {
				href: '/profile',
				isCurrentPage: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Profile`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}