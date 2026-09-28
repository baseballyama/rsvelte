import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem } from "carbon-components-svelte";

export default function BreadcrumbFixture($$renderer) {
	Breadcrumb($$renderer, {
		'data-testid': 'breadcrumb',
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