import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/buttons/Button.svelte";
import { DarkMode } from "$lib";
import Li from "$lib/typography/list/Li.svelte";
import List from "$lib/typography/list/List.svelte";
import ArrowRight from "../utils/icons/ArrowRight.svelte";
import Check from "../utils/icons/Check.svelte";
import Moon from "../utils/icons/Moon.svelte";
import Sun from "../utils/icons/Sun.svelte";
import A from "./utils/A.svelte";
import H2 from "./utils/H2.svelte";
import Row from "./utils/Row.svelte";
import Section from "./utils/Section.svelte";

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`Start building <!>`, 1);

var root_2 = $.from_html(
	`<div class="flex flex-col items-start gap-3 self-stretch sm:gap-4"><!> <p class="text-lg text-gray-500 dark:text-gray-400"><!> is a free and open-source UI component library built using Svelte based on Flowbite and Tailwind CSS.</p> <p class="text-lg text-gray-500 dark:text-gray-400">By installing the package via NPM you will be able to build modern looking web applications fast by leveraging Svelte, Tailwind CSS and Flowbite using ready-made UI components like dropdowns,
        navbars, modals, and more.</p></div> <div class="flex flex-col items-start self-stretch pt-8"><!> <div class="flex flex-row gap-4"><!> <!></div></div>`,
	1
);

var root_3 = $.from_html(`<!> Increased accessibility based on room brightness`, 1);
var root_4 = $.from_html(`<!> Better visibility for users with low vision`, 1);
var root_5 = $.from_html(`<!> Improved readability for users with light sensitivity`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<div class="flex flex-row gap-8 text-red-500"><div class="flex flex-col items-center gap-2 font-medium text-gray-900 dark:text-gray-400"><!> <!> Light</div> <div class="flex flex-col items-center gap-2 font-medium text-gray-400 dark:text-white"><!> <!> Dark</div></div> <div class="flex flex-col items-start gap-4 self-stretch py-4"><!> <p class="mb-2 text-lg text-gray-500 dark:text-gray-400">Flowbite Svelte supports <!> and can be easily integrated into your project by following the official documentation based on Svelte.</p> <p class="text-lg text-gray-500 dark:text-gray-400">Enabling dark mode will allow users to either select the preferred method (light or dark) or automatically switch based on the operating system settings.</p></div> <!> <a href="/docs/components/darkmode" class="text-primary-600 flex items-center gap-4 font-medium hover:underline">Learn more how to integrate dark mode <!></a>`, 1);

var root_8 = $.from_html(`<div class="flex flex-col items-start gap-4 self-stretch"><!> <p class="text-lg text-gray-500 dark:text-gray-400">Flowbite Svelte uses the Tailwind CSS utility classes under the hood which means it will be easy to customize the appearance and specifications of the UI components directly from the HTML
        code.</p> <p class="text-lg text-gray-500 dark:text-gray-400"><!> is a popular and open-source utility-first CSS framework that you can use to speed up the development of your front-end projects.</p> <p class="text-lg text-gray-500 dark:text-gray-400">Flowbite Svelte is also based on the core <!> UI component library the also features interactive UI components like dropdowns, modals, navbars, and more.</p></div>`);

export default function CTA($$anchor) {
	const features = [
		"Huge collection of UI components",
		"Open-source under the MIT License",
		"Interactivity handled by Svelte",
		"Utility classes based on Tailwind CSS",
		"Based on the Flowbite ecosystem and design"
	];

	Section($$anchor, {
		class: 'lg:py-24',
		tinted: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_6();
			var node = $.first_child(fragment_1);

			Row(node, {
				image: 'bg-[url(\'/images/code-example.png\')] dark:bg-[url(\'/images/code-example-dark.png\')]',
				divide: true,
				h_full: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var div = $.first_child(fragment_2);
					var node_1 = $.child(div);

					H2(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Svelte UI components');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var p = $.sibling(node_1, 2);
					var node_2 = $.child(p);

					A(node_2, {
						href: '/docs/pages/introduction',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Flowbite Svelte');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.next();
					$.reset(p);
					$.next(2);
					$.reset(div);

					var div_1 = $.sibling(div, 2);
					var node_3 = $.child(div_1);

					List(node_3, {
						tag: 'ul',
						class: 'mb-6 space-y-4 font-medium text-gray-900 lg:mb-8 dark:text-white',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, () => features, $.index, ($$anchor, feature) => {
								Li($$anchor, {
									icon: true,
									class: 'gap-2',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_5 = $.first_child(fragment_5);

										Check(node_5, {
											class: 'bg-primary-100 text-primary-700 h-5 w-5 rounded-full p-1 dark:bg-gray-700'
										});

										var text_2 = $.sibling(node_5);

										$.template_effect(() => $.set_text(text_2, ` ${$.get(feature) ?? ''}`));
										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var div_2 = $.sibling(node_3, 2);
					var node_6 = $.child(div_2);

					Button(node_6, {
						href: '/docs/pages/introduction',
						color: 'primary',
						class: 'gap-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_6 = root_1();
							var node_7 = $.sibling($.first_child(fragment_6));

							ArrowRight(node_7, {});
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_6, 2);

					Button(node_8, {
						href: 'https://github.com/themesberg/flowbite-svelte',
						color: 'light',
						class: 'w-auto dark:text-gray-400!',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('View on GitHub');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_2);
					$.reset(div_1);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node, 2);

			Row(node_9, {
				image: 'bg-[url(\'/images/graphs.png\')] dark:bg-[url(\'/images/graphs-dark.png\')]',
				reversed: true,
				contain: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_7();
					var div_3 = $.first_child(fragment_7);
					var div_4 = $.child(div_3);
					var node_10 = $.child(div_4);

					DarkMode(node_10, { size: 'lg', class: 'hidden dark:block dark:bg-gray-700' });

					var node_11 = $.sibling(node_10, 2);

					Sun(node_11, {
						class: 'bg-primary-700 h-11 w-11 rounded-lg p-2 text-white dark:hidden  dark:bg-gray-700'
					});

					$.next();
					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var node_12 = $.child(div_5);

					Moon(node_12, {
						class: 'bg-primary-700 hidden h-11 w-11 rounded-lg p-2 dark:block'
					});

					var node_13 = $.sibling(node_12, 2);

					DarkMode(node_13, {
						size: 'lg',
						class: 'bg-gray-100 hover:bg-gray-200 dark:hidden dark:bg-gray-700'
					});

					$.next();
					$.reset(div_5);
					$.reset(div_3);

					var div_6 = $.sibling(div_3, 2);
					var node_14 = $.child(div_6);

					H2(node_14, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Dark mode integration');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var p_1 = $.sibling(node_14, 2);
					var node_15 = $.sibling($.child(p_1));

					A(node_15, {
						href: '/docs/components/darkmode',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('dark mode');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					$.next();
					$.reset(p_1);
					$.next(2);
					$.reset(div_6);

					var node_16 = $.sibling(div_6, 2);

					List(node_16, {
						tag: 'ul',
						class: 'space-y-4 self-stretch border-t pt-8 font-medium text-gray-900 dark:border-gray-700 dark:text-white',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_6();
							var node_17 = $.first_child(fragment_8);

							Li(node_17, {
								icon: true,
								class: 'gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_3();
									var node_18 = $.first_child(fragment_9);

									Check(node_18, {
										class: 'bg-primary-100 text-primary-700 h-5 w-5 rounded-full p-1 dark:bg-gray-700'
									});

									$.next();
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_17, 2);

							Li(node_19, {
								icon: true,
								class: 'gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_4();
									var node_20 = $.first_child(fragment_10);

									Check(node_20, {
										class: 'bg-primary-100 text-primary-700 h-5 w-5 rounded-full p-1 dark:bg-gray-700'
									});

									$.next();
									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_19, 2);

							Li(node_21, {
								icon: true,
								class: 'gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_5();
									var node_22 = $.first_child(fragment_11);

									Check(node_22, {
										class: 'bg-primary-100 text-primary-700 h-5 w-5 rounded-full p-1 dark:bg-gray-700'
									});

									$.next();
									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					var a = $.sibling(node_16, 2);
					var node_23 = $.sibling($.child(a));

					ArrowRight(node_23, {});
					$.reset(a);
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var node_24 = $.sibling(node_9, 2);

			Row(node_24, {
				image: 'bg-[url(\'/images/tailwind-code.png\')] dark:bg-[url(\'/images/tailwind-code-dark.png\')]',
				divide: true,
				children: ($$anchor, $$slotProps) => {
					var div_7 = root_8();
					var node_25 = $.child(div_7);

					H2(node_25, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Works with Tailwind CSS');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var p_2 = $.sibling(node_25, 4);
					var node_26 = $.child(p_2);

					A(node_26, {
						href: 'https://tailwindcss.com',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Tailwind CSS');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					$.next();
					$.reset(p_2);

					var p_3 = $.sibling(p_2, 2);
					var node_27 = $.sibling($.child(p_3));

					A(node_27, {
						href: 'https://flowbite.com',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Flowbite');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.next();
					$.reset(p_3);
					$.reset(div_7);
					$.append($$anchor, div_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}