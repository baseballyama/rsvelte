import * as $ from 'svelte/internal/server';
import Component from '@lucide/svelte/icons/component';
import Home from '@lucide/svelte/icons/home';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '$lib/components/ui/breadcrumb';

export default function Breadcrumb_04($$renderer) {
	Breadcrumb($$renderer, {
		children: ($$renderer) => {
			BreadcrumbList($$renderer, {
				children: ($$renderer) => {
					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbLink($$renderer, {
								href: '#title',
								class: 'inline-flex items-center gap-1.5',
								children: ($$renderer) => {
									Home($$renderer, { size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----> Home`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					BreadcrumbSeparator($$renderer, {});
					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							BreadcrumbLink($$renderer, {
								href: '#title',
								class: 'inline-flex items-center gap-1.5',
								children: ($$renderer) => {
									Component($$renderer, { size: 16, 'aria-hidden': 'true' });
									$$renderer.push(`<!----> Components`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					BreadcrumbSeparator($$renderer, {});
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