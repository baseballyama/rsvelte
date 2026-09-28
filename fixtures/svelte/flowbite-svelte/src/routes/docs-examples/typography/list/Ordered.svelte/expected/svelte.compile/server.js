import * as $ from 'svelte/internal/server';
import { List, Li, Span, Heading } from "flowbite-svelte";

export default function Ordered($$renderer) {
	Heading($$renderer, {
		tag: 'h2',
		class: 'mb-2 text-lg font-semibold  text-gray-900 dark:text-white',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Top students:`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	List($$renderer, {
		tag: 'ol',
		class: 'space-y-1 text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			Li($$renderer, {
				children: ($$renderer) => {
					Span($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Bonnie Green`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> with `);

					Span($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->70`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> points`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					Span($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Jese Leos`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> with `);

					Span($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->63`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> points`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					Span($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Leslie Livingston`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> with `);

					Span($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->57`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> points`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}