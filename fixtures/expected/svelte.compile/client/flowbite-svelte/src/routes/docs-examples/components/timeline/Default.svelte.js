import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Timeline, TimelineItem, Button } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Learn more<!>`, 1);
var root_1 = $.from_html(`<p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.</p> <!>`, 1);
var root_2 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">All of the pages and components are first designed in Figma and we keep a parity between the two versions even as we update the project.</p>`);
var root_3 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor) {
	Timeline($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			TimelineItem(node, {
				title: 'Application UI code in Tailwind CSS',
				date: 'February 2022',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.sibling($.first_child(fragment_2), 2);

					Button(node_1, {
						color: 'alternative',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root();
							var node_2 = $.sibling($.first_child(fragment_3));

							ArrowRightOutline(node_2, { class: 'ms-2 h-5 w-5' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			TimelineItem(node_3, {
				title: 'Application UI code in Tailwind CSS',
				date: 'March 2022',
				children: ($$anchor, $$slotProps) => {
					var p = root_2();

					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			TimelineItem(node_4, {
				title: 'Application UI code in Tailwind CSS',
				date: 'April 2022',
				children: ($$anchor, $$slotProps) => {
					var p_1 = root_3();

					$.append($$anchor, p_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}