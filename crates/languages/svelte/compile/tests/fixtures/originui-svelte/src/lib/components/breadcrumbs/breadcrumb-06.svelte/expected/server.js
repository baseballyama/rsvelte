import * as $ from 'svelte/internal/server';
import Home from '@lucide/svelte/icons/home';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

export default function Breadcrumb_06($$renderer) {
	Breadcrumb($$renderer, {
		children: ($$renderer) => {
			BreadcrumbList($$renderer, {
				children: ($$renderer) => {
					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbLink($$renderer, {
								href: '#title',
								children: ($$renderer) => {
									Home($$renderer, { size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----> <span class="sr-only">Home</span>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbSeparator($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->·`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbLink($$renderer, {
								href: '#title',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Components`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbSeparator($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->·`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbPage($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Breadcrumb`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}