import * as $ from 'svelte/internal/server';
import Breadcrumb from "carbon-components-svelte/Breadcrumb/Breadcrumb.svelte";
import BreadcrumbItem from "carbon-components-svelte/Breadcrumb/BreadcrumbItem.svelte";

export default function Breadcrumb_labelText_test($$renderer) {
	Breadcrumb($$renderer, {
		labelText: 'Page navigation',
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
				isCurrentPage: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Reports`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}