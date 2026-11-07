import * as $ from 'svelte/internal/server';
import { List, DescriptionList } from "flowbite-svelte";

export default function Description($$renderer) {
	List($$renderer, {
		tag: 'dl',
		class: 'divide-y divide-gray-200 text-gray-900 dark:divide-gray-700  dark:text-white',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col pb-3">`);

			DescriptionList($$renderer, {
				tag: 'dt',
				class: 'mb-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Email address`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DescriptionList($$renderer, {
				tag: 'dd',
				children: ($$renderer) => {
					$$renderer.push(`<!---->yourname@flowbite.com`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-col pb-3">`);

			DescriptionList($$renderer, {
				tag: 'dt',
				class: 'mb-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Home address`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DescriptionList($$renderer, {
				tag: 'dd',
				children: ($$renderer) => {
					$$renderer.push(`<!---->92 Miles Drive, Newark, NJ 07103, California, USA`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="flex flex-col pb-3">`);

			DescriptionList($$renderer, {
				tag: 'dt',
				class: 'mb-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Phone number`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DescriptionList($$renderer, {
				tag: 'dd',
				children: ($$renderer) => {
					$$renderer.push(`<!---->+00 123 456 789 / +12 345 678`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}