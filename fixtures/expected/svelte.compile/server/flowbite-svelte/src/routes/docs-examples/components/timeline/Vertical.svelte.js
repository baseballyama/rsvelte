import * as $ from 'svelte/internal/server';
import { Timeline, TimelineItem } from "flowbite-svelte";
import { CalendarWeekSolid } from "flowbite-svelte-icons";

export default function Vertical($$renderer) {
	Timeline($$renderer, {
		order: 'vertical',
		children: ($$renderer) => {
			{
				function orientationSlot($$renderer) {
					$$renderer.push(`<span class="bg-primary-200 dark:bg-primary-900 absolute -left-4 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900">`);
					CalendarWeekSolid($$renderer, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$$renderer.push(`<!----></span>`);
				}

				TimelineItem($$renderer, {
					title: 'Flowbite Application UI v2.0.0',
					date: 'Released on January 13th, 2022',
					orientationSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="mb-4 pl-4 text-base font-normal text-gray-500 dark:text-gray-400">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce &amp; Marketing pages.</p>`);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function orientationSlot($$renderer) {
					$$renderer.push(`<span class="bg-primary-200 dark:bg-primary-900 absolute -left-4 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900">`);
					CalendarWeekSolid($$renderer, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$$renderer.push(`<!----></span>`);
				}

				TimelineItem($$renderer, {
					title: 'Flowbite Figma v1.3.0',
					date: 'Released on December 7th, 2021',
					orientationSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="pl-4 text-base font-normal text-gray-500 dark:text-gray-400">All of the pages and components are first designed in Figma and we keep a parity between the two versions even as we update the project.</p>`);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function orientationSlot($$renderer) {
					$$renderer.push(`<span class="bg-primary-200 dark:bg-primary-900 absolute -left-4 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900">`);
					CalendarWeekSolid($$renderer, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$$renderer.push(`<!----></span>`);
				}

				TimelineItem($$renderer, {
					title: 'Flowbite Library v1.2.2',
					date: 'Released on December 2nd, 2021',
					orientationSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="pl-4 text-base font-normal text-gray-500 dark:text-gray-400">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p>`);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}