import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs, TabItem, Timeline, TimelineItem, Button } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<span>Profile</span>`);
var root_1 = $.from_html(`Learn more <!>`, 1);
var root_2 = $.from_html(`<p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.</p> <!>`, 1);
var root_3 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">All of the pages and components are first designed in Figma and we keep a parity between the two versions even as we update the project.</p>`);
var root_4 = $.from_html(`<p class="text-base font-normal text-gray-500 dark:text-gray-400">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p>`);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<span>Dashboard</span>`);
var root_7 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Dashboard:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_8 = $.from_html(`<span>Settings</span>`);
var root_9 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Settings:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_10 = $.from_html(`<span>Users</span>`);
var root_11 = $.from_html(`<p class="text-sm text-gray-500 dark:text-gray-400"><b>Users:</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`);
var root_12 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function CompoIn($$anchor) {
	Tabs($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_12();
			var node = $.first_child(fragment_1);

			{
				const titleSlot = ($$anchor) => {
					var span = root();

					$.append($$anchor, span);
				};

				TabItem(node, {
					open: true,
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						Timeline($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_5();
								var node_1 = $.first_child(fragment_3);

								TimelineItem(node_1, {
									title: 'Application UI code in Tailwind CSS',
									date: 'February 2022',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_2();
										var node_2 = $.sibling($.first_child(fragment_4), 2);

										Button(node_2, {
											color: 'alternative',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_5 = root_1();
												var node_3 = $.sibling($.first_child(fragment_5));

												ArrowRightOutline(node_3, { class: 'ms-2 h-5 w-5' });
												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								var node_4 = $.sibling(node_1, 2);

								TimelineItem(node_4, {
									title: 'Application UI code in Tailwind CSS',
									date: 'March 2022',
									children: ($$anchor, $$slotProps) => {
										var p = root_3();

										$.append($$anchor, p);
									},
									$$slots: { default: true }
								});

								var node_5 = $.sibling(node_4, 2);

								TimelineItem(node_5, {
									title: 'Application UI code in Tailwind CSS',
									date: 'April 2022',
									children: ($$anchor, $$slotProps) => {
										var p_1 = root_4();

										$.append($$anchor, p_1);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			var node_6 = $.sibling(node, 2);

			{
				const titleSlot = ($$anchor) => {
					var span_1 = root_6();

					$.append($$anchor, span_1);
				};

				TabItem(node_6, {
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p_2 = root_7();

						$.append($$anchor, p_2);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				const titleSlot = ($$anchor) => {
					var span_2 = root_8();

					$.append($$anchor, span_2);
				};

				TabItem(node_7, {
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p_3 = root_9();

						$.append($$anchor, p_3);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			var node_8 = $.sibling(node_7, 2);

			{
				const titleSlot = ($$anchor) => {
					var span_3 = root_10();

					$.append($$anchor, span_3);
				};

				TabItem(node_8, {
					titleSlot,
					children: ($$anchor, $$slotProps) => {
						var p_4 = root_11();

						$.append($$anchor, p_4);
					},
					$$slots: { titleSlot: true, default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}