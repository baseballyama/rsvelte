import * as $ from 'svelte/internal/server';
import { Card, Heading } from "flowbite-svelte";

export default function CardOld($$renderer, $$props) {
	let { children, title, subtitle, class: className } = $$props;

	Card($$renderer, {
		size: 'xl',
		class: `max-w-none shadow-sm ${$.stringify(className)}`,
		children: ($$renderer) => {
			$$renderer.push(`<div class="mt-px mb-4 lg:mb-0">`);

			Heading($$renderer, {
				tag: 'h3',
				class: 'mb-2 -ml-0.25 text-xl font-semibold dark:text-white',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(title)}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (subtitle) {
				$$renderer.push(`<!--[0--><span class="text-base font-normal text-gray-500 dark:text-gray-300">${$.escape(subtitle)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);
			children($$renderer);
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}