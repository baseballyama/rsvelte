import * as $ from 'svelte/internal/server';
import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
import MetaTag from "../../../utils/MetaTag.svelte";
import { Playground } from "flowbite-svelte-admin-dashboard";

export default function _page($$renderer) {
	const path = "/playground/stacked";
	const description = "Playground stacked example - Flowbite Svelte Admin Dashboard";
	const metaTitle = "Flowbite Svelte Admin Dashboard - Playground stacked";
	const subtitle = "Playground stacked";

	MetaTag($$renderer, { path, description, title: metaTitle, subtitle });
	$$renderer.push(`<!----> <div id="main-content" class="relative mx-auto h-full w-full max-w-screen-2xl overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">`);

	{
		function breadcrumb($$renderer) {
			Breadcrumb($$renderer, {
				class: 'mb-5',
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
							$$renderer.push(`<!---->Playground`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Stacked`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		Playground($$renderer, {
			title: 'Create something awesome here',
			breadcrumb,
			$$slots: { breadcrumb: true }
		});
	}

	$$renderer.push(`<!----></div>`);
}