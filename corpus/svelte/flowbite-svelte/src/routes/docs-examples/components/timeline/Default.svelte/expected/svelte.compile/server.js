import * as $ from 'svelte/internal/server';
import { Timeline, TimelineItem, Button } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

export default function Default($$renderer) {
	Timeline($$renderer, {
		children: ($$renderer) => {
			TimelineItem($$renderer, {
				title: 'Application UI code in Tailwind CSS',
				date: 'February 2022',
				children: ($$renderer) => {
					$$renderer.push(`<p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce &amp; Marketing pages.</p> `);

					Button($$renderer, {
						color: 'alternative',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Learn more`);
							ArrowRightOutline($$renderer, { class: 'ms-2 h-5 w-5' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TimelineItem($$renderer, {
				title: 'Application UI code in Tailwind CSS',
				date: 'March 2022',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">All of the pages and components are first designed in Figma and we keep a parity between the two versions even as we update the project.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			TimelineItem($$renderer, {
				title: 'Application UI code in Tailwind CSS',
				date: 'April 2022',
				children: ($$renderer) => {
					$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}