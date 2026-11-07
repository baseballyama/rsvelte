import * as $ from 'svelte/internal/server';
import { List, Li, Heading } from "flowbite-svelte";

export default function UnorderedUnstyled($$renderer) {
	Heading($$renderer, {
		tag: 'h2',
		class: 'mb-2 text-lg font-semibold  text-gray-900 dark:text-white',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Password requirements`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	List($$renderer, {
		tag: 'dl',
		class: 'space-y-1 text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->At least 10 characters (and up to 100 characters)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->At least one lowercase character`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Inclusion of at least one special character, e.g., ! @ # ?`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}