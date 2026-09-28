import * as $ from 'svelte/internal/server';
import { Timeline, TimelineItem } from "flowbite-svelte";
import { CalendarWeekSolid } from "flowbite-svelte-icons";

export default function Horizontal($$renderer) {
	Timeline($$renderer, {
		order: 'horizontal',
		children: ($$renderer) => {
			{
				function orientationSlot($$renderer) {
					$$renderer.push(`<div class="flex items-center"><div class="bg-primary-200 dark:bg-primary-900 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-0 ring-white sm:ring-8 dark:ring-gray-900">`);
					CalendarWeekSolid($$renderer, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$$renderer.push(`<!----></div> <div class="hidden h-0.5 w-full bg-gray-200 sm:flex dark:bg-gray-700"></div></div>`);
				}

				TimelineItem($$renderer, {
					title: 'Flowbite Library v1.0.0',
					date: 'Released on December 2nd, 2021',
					orientationSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">Get started with dozens of web components and interactive elements.</p>`);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function orientationSlot($$renderer) {
					$$renderer.push(`<div class="flex items-center"><div class="bg-primary-200 dark:bg-primary-900 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-0 ring-white sm:ring-8 dark:ring-gray-900">`);
					CalendarWeekSolid($$renderer, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$$renderer.push(`<!----></div> <div class="hidden h-0.5 w-full bg-gray-200 sm:flex dark:bg-gray-700"></div></div>`);
				}

				TimelineItem($$renderer, {
					title: 'Flowbite Library v1.2.0',
					date: 'Released on December 23th, 2021',
					orientationSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">Get started with dozens of web components and interactive elements.</p>`);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function orientationSlot($$renderer) {
					$$renderer.push(`<div class="flex items-center"><div class="bg-primary-200 dark:bg-primary-900 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-0 ring-white sm:ring-8 dark:ring-gray-900">`);
					CalendarWeekSolid($$renderer, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$$renderer.push(`<!----></div> <div class="hidden h-0.5 w-full bg-gray-200 sm:flex dark:bg-gray-700"></div></div>`);
				}

				TimelineItem($$renderer, {
					title: 'Flowbite Library v1.3.0',
					date: 'Released on January 5th, 2021',
					orientationSlot,
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">Get started with dozens of web components and interactive elements.</p>`);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}