import * as $ from 'svelte/internal/server';
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

export default function CTA($$renderer) {
	const features = [
		"Huge collection of UI components",
		"Open-source under the MIT License",
		"Interactivity handled by Svelte",
		"Utility classes based on Tailwind CSS",
		"Based on the Flowbite ecosystem and design"
	];

	Section($$renderer, {
		class: 'lg:py-24',
		tinted: true,
		children: ($$renderer) => {
			Row($$renderer, {
				image: 'bg-[url(\'/images/code-example.png\')] dark:bg-[url(\'/images/code-example-dark.png\')]',
				divide: true,
				h_full: true,
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col items-start gap-3 self-stretch sm:gap-4">`);

					H2($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Svelte UI components`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <p class="text-lg text-gray-500 dark:text-gray-400">`);

					A($$renderer, {
						href: '/docs/pages/introduction',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Flowbite Svelte`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> is a free and open-source UI component library built using Svelte based on Flowbite and Tailwind CSS.</p> <p class="text-lg text-gray-500 dark:text-gray-400">By installing the package via NPM you will be able to build modern looking web applications fast by leveraging Svelte, Tailwind CSS and Flowbite using ready-made UI components like dropdowns,
        navbars, modals, and more.</p></div> <div class="flex flex-col items-start self-stretch pt-8">`);

					List($$renderer, {
						tag: 'ul',
						class: 'mb-6 space-y-4 font-medium text-gray-900 lg:mb-8 dark:text-white',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(features);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let feature = each_array[$$index];

								Li($$renderer, {
									icon: true,
									class: 'gap-2',
									children: ($$renderer) => {
										Check($$renderer, {
											class: 'bg-primary-100 text-primary-700 h-5 w-5 rounded-full p-1 dark:bg-gray-700'
										});

										$$renderer.push(`<!----> ${$.escape(feature)}`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <div class="flex flex-row gap-4">`);

					Button($$renderer, {
						href: '/docs/pages/introduction',
						color: 'primary',
						class: 'gap-2',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Start building `);
							ArrowRight($$renderer, {});
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						href: 'https://github.com/themesberg/flowbite-svelte',
						color: 'light',
						class: 'w-auto dark:text-gray-400!',
						children: ($$renderer) => {
							$$renderer.push(`<!---->View on GitHub`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Row($$renderer, {
				image: 'bg-[url(\'/images/graphs.png\')] dark:bg-[url(\'/images/graphs-dark.png\')]',
				reversed: true,
				contain: true,
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-row gap-8 text-red-500"><div class="flex flex-col items-center gap-2 font-medium text-gray-900 dark:text-gray-400">`);
					DarkMode($$renderer, { size: 'lg', class: 'hidden dark:block dark:bg-gray-700' });
					$$renderer.push(`<!----> `);

					Sun($$renderer, {
						class: 'bg-primary-700 h-11 w-11 rounded-lg p-2 text-white dark:hidden  dark:bg-gray-700'
					});

					$$renderer.push(`<!----> Light</div> <div class="flex flex-col items-center gap-2 font-medium text-gray-400 dark:text-white">`);

					Moon($$renderer, {
						class: 'bg-primary-700 hidden h-11 w-11 rounded-lg p-2 dark:block'
					});

					$$renderer.push(`<!----> `);

					DarkMode($$renderer, {
						size: 'lg',
						class: 'bg-gray-100 hover:bg-gray-200 dark:hidden dark:bg-gray-700'
					});

					$$renderer.push(`<!----> Dark</div></div> <div class="flex flex-col items-start gap-4 self-stretch py-4">`);

					H2($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Dark mode integration`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <p class="mb-2 text-lg text-gray-500 dark:text-gray-400">Flowbite Svelte supports `);

					A($$renderer, {
						href: '/docs/components/darkmode',
						children: ($$renderer) => {
							$$renderer.push(`<!---->dark mode`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> and can be easily integrated into your project by following the official documentation based on Svelte.</p> <p class="text-lg text-gray-500 dark:text-gray-400">Enabling dark mode will allow users to either select the preferred method (light or dark) or automatically switch based on the operating system settings.</p></div> `);

					List($$renderer, {
						tag: 'ul',
						class: 'space-y-4 self-stretch border-t pt-8 font-medium text-gray-900 dark:border-gray-700 dark:text-white',
						children: ($$renderer) => {
							Li($$renderer, {
								icon: true,
								class: 'gap-2',
								children: ($$renderer) => {
									Check($$renderer, {
										class: 'bg-primary-100 text-primary-700 h-5 w-5 rounded-full p-1 dark:bg-gray-700'
									});

									$$renderer.push(`<!----> Increased accessibility based on room brightness`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Li($$renderer, {
								icon: true,
								class: 'gap-2',
								children: ($$renderer) => {
									Check($$renderer, {
										class: 'bg-primary-100 text-primary-700 h-5 w-5 rounded-full p-1 dark:bg-gray-700'
									});

									$$renderer.push(`<!----> Better visibility for users with low vision`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Li($$renderer, {
								icon: true,
								class: 'gap-2',
								children: ($$renderer) => {
									Check($$renderer, {
										class: 'bg-primary-100 text-primary-700 h-5 w-5 rounded-full p-1 dark:bg-gray-700'
									});

									$$renderer.push(`<!----> Improved readability for users with light sensitivity`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <a href="/docs/components/darkmode" class="text-primary-600 flex items-center gap-4 font-medium hover:underline">Learn more how to integrate dark mode `);
					ArrowRight($$renderer, {});
					$$renderer.push(`<!----></a>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Row($$renderer, {
				image: 'bg-[url(\'/images/tailwind-code.png\')] dark:bg-[url(\'/images/tailwind-code-dark.png\')]',
				divide: true,
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col items-start gap-4 self-stretch">`);

					H2($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Works with Tailwind CSS`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> <p class="text-lg text-gray-500 dark:text-gray-400">Flowbite Svelte uses the Tailwind CSS utility classes under the hood which means it will be easy to customize the appearance and specifications of the UI components directly from the HTML
        code.</p> <p class="text-lg text-gray-500 dark:text-gray-400">`);

					A($$renderer, {
						href: 'https://tailwindcss.com',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Tailwind CSS`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> is a popular and open-source utility-first CSS framework that you can use to speed up the development of your front-end projects.</p> <p class="text-lg text-gray-500 dark:text-gray-400">Flowbite Svelte is also based on the core `);

					A($$renderer, {
						href: 'https://flowbite.com',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Flowbite`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> UI component library the also features interactive UI components like dropdowns, modals, navbars, and more.</p></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}