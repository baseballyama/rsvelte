import * as $ from 'svelte/internal/server';
import { Heading, Breadcrumb, BreadcrumbItem } from "flowbite-svelte";

export default function Breadcrumb_1($$renderer) {
	Breadcrumb($$renderer, {
		class: 'mb-4',
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
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			BreadcrumbItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Team`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Heading($$renderer, {
		tag: 'h2',
		class: 'mb-4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Team management`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}