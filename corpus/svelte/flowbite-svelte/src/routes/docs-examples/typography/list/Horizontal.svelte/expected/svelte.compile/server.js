import * as $ from 'svelte/internal/server';
import { List, Li, A } from "flowbite-svelte";

export default function Horizontal($$renderer) {
	List($$renderer, {
		tag: 'dl',
		class: 'mb-6 flex flex-wrap items-center justify-center',
		children: ($$renderer) => {
			Li($$renderer, {
				children: ($$renderer) => {
					A($$renderer, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$renderer) => {
							$$renderer.push(`<!---->About`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					A($$renderer, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Premium`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					A($$renderer, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Campaigns`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					A($$renderer, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Blog`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					A($$renderer, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Affiliate Program`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					A($$renderer, {
						href: '/',
						class: 'me-4 text-gray-700 hover:underline md:me-6 dark:text-white',
						children: ($$renderer) => {
							$$renderer.push(`<!---->FAQs`);
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
}