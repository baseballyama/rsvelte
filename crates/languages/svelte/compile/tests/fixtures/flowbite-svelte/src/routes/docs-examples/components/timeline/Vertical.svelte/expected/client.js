import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Timeline, TimelineItem } from "flowbite-svelte";
import { CalendarWeekSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<span class="bg-primary-200 dark:bg-primary-900 absolute -left-4 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-900"><!></span>`);
var root_1 = $.from_html(`<p class="mb-4 pl-4 text-base font-normal text-gray-500 dark:text-gray-400">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.</p>`);
var root_2 = $.from_html(`<p class="pl-4 text-base font-normal text-gray-500 dark:text-gray-400">All of the pages and components are first designed in Figma and we keep a parity between the two versions even as we update the project.</p>`);
var root_3 = $.from_html(`<p class="pl-4 text-base font-normal text-gray-500 dark:text-gray-400">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Vertical($$anchor) {
	Timeline($$anchor, {
		order: 'vertical',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			{
				const orientationSlot = ($$anchor) => {
					var span = root();
					var node_1 = $.child(span);

					CalendarWeekSolid(node_1, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$.reset(span);
					$.append($$anchor, span);
				};

				TimelineItem(node, {
					title: 'Flowbite Application UI v2.0.0',
					date: 'Released on January 13th, 2022',
					orientationSlot,
					children: ($$anchor, $$slotProps) => {
						var p = root_1();

						$.append($$anchor, p);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			var node_2 = $.sibling(node, 2);

			{
				const orientationSlot = ($$anchor) => {
					var span_1 = root();
					var node_3 = $.child(span_1);

					CalendarWeekSolid(node_3, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$.reset(span_1);
					$.append($$anchor, span_1);
				};

				TimelineItem(node_2, {
					title: 'Flowbite Figma v1.3.0',
					date: 'Released on December 7th, 2021',
					orientationSlot,
					children: ($$anchor, $$slotProps) => {
						var p_1 = root_2();

						$.append($$anchor, p_1);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			var node_4 = $.sibling(node_2, 2);

			{
				const orientationSlot = ($$anchor) => {
					var span_2 = root();
					var node_5 = $.child(span_2);

					CalendarWeekSolid(node_5, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$.reset(span_2);
					$.append($$anchor, span_2);
				};

				TimelineItem(node_4, {
					title: 'Flowbite Library v1.2.2',
					date: 'Released on December 2nd, 2021',
					orientationSlot,
					children: ($$anchor, $$slotProps) => {
						var p_2 = root_3();

						$.append($$anchor, p_2);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}