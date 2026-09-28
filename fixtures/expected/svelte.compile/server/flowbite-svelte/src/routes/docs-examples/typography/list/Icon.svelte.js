import * as $ from 'svelte/internal/server';
import { List, Li, Span } from "flowbite-svelte";
import { CheckOutline } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	List($$renderer, {
		tag: 'ul',
		class: 'mb-8 space-y-4 text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			Li($$renderer, {
				icon: true,
				class: 'gap-3',
				children: ($$renderer) => {
					CheckOutline($$renderer, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });
					$$renderer.push(`<!----> Individual configuration`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				icon: true,
				class: 'gap-3',
				children: ($$renderer) => {
					CheckOutline($$renderer, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });
					$$renderer.push(`<!----> No setup, or hidden fees`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				icon: true,
				class: 'gap-3',
				children: ($$renderer) => {
					CheckOutline($$renderer, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });
					$$renderer.push(`<!----> <span>Team size: `);

					Span($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->1 developer`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				icon: true,
				class: 'gap-3',
				children: ($$renderer) => {
					CheckOutline($$renderer, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });
					$$renderer.push(`<!----> <span>Premium support: `);

					Span($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->6 months`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				icon: true,
				class: 'gap-3',
				children: ($$renderer) => {
					CheckOutline($$renderer, { class: 'h-5 w-5 text-green-500 dark:text-green-400' });
					$$renderer.push(`<!----> <span>Free updates: `);

					Span($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->6 months`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}