import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Timeline, TimelineItem } from "flowbite-svelte";
import { CalendarWeekSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="flex items-center"><div class="bg-primary-200 dark:bg-primary-900 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-0 ring-white sm:ring-8 dark:ring-gray-900"><!></div> <div class="hidden h-0.5 w-full bg-gray-200 sm:flex dark:bg-gray-700"></div></div>`);
var root_1 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">Get started with dozens of web components and interactive elements.</p>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Horizontal($$anchor) {
	Timeline($$anchor, {
		order: 'horizontal',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			{
				const orientationSlot = ($$anchor) => {
					var div = root();
					var div_1 = $.child(div);
					var node_1 = $.child(div_1);

					CalendarWeekSolid(node_1, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$.reset(div_1);
					$.next(2);
					$.reset(div);
					$.append($$anchor, div);
				};

				TimelineItem(node, {
					title: 'Flowbite Library v1.0.0',
					date: 'Released on December 2nd, 2021',
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
					var div_2 = root();
					var div_3 = $.child(div_2);
					var node_3 = $.child(div_3);

					CalendarWeekSolid(node_3, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$.reset(div_3);
					$.next(2);
					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				TimelineItem(node_2, {
					title: 'Flowbite Library v1.2.0',
					date: 'Released on December 23th, 2021',
					orientationSlot,
					children: ($$anchor, $$slotProps) => {
						var p_1 = root_1();

						$.append($$anchor, p_1);
					},
					$$slots: { orientationSlot: true, default: true }
				});
			}

			var node_4 = $.sibling(node_2, 2);

			{
				const orientationSlot = ($$anchor) => {
					var div_4 = root();
					var div_5 = $.child(div_4);
					var node_5 = $.child(div_5);

					CalendarWeekSolid(node_5, { class: 'text-primary-600 dark:text-primary-400 h-4 w-4' });
					$.reset(div_5);
					$.next(2);
					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				TimelineItem(node_4, {
					title: 'Flowbite Library v1.3.0',
					date: 'Released on January 5th, 2021',
					orientationSlot,
					children: ($$anchor, $$slotProps) => {
						var p_2 = root_1();

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