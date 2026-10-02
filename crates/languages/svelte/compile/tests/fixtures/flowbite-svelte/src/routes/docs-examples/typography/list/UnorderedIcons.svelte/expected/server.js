import * as $ from 'svelte/internal/server';
import { List, Li, Heading } from "flowbite-svelte";
import { CheckCircleSolid, CloseCircleSolid } from "flowbite-svelte-icons";

export default function UnorderedIcons($$renderer) {
	Heading($$renderer, {
		tag: 'h2',
		class: 'mb-2 text-lg font-semibold text-gray-900 dark:text-white',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Password requirements`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	List($$renderer, {
		tag: 'ul',
		class: 'space-y-1 text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			Li($$renderer, {
				icon: true,
				children: ($$renderer) => {
					CheckCircleSolid($$renderer, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
					$$renderer.push(`<!----> At least 10 characters (and up to 100 characters)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				icon: true,
				children: ($$renderer) => {
					CheckCircleSolid($$renderer, { class: 'me-2 h-5 w-5 text-green-500 dark:text-green-400' });
					$$renderer.push(`<!----> At least one lowercase character`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Li($$renderer, {
				icon: true,
				children: ($$renderer) => {
					CloseCircleSolid($$renderer, { class: 'me-2 h-5 w-5 text-gray-500 dark:text-gray-400' });
					$$renderer.push(`<!----> Inclusion of at least one special character, e.g., ! @ # ?`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}