import * as $ from 'svelte/internal/server';
import { afterNavigate } from "$app/navigation";
import { page } from "$app/state";

import {
	Sidebar,
	SidebarGroup,
	SidebarItem,
	uiHelpers,
	SidebarButton,
	SidebarDropdownWrapper
} from "$lib";

import { getContext } from "svelte";
import Toc from "../utils/Toc.svelte";
import { extract } from "./component/Anchor.svelte";
import { capitalizeFirstLetter } from "../builder/utils/helpers";

export default function ComponentsLayout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, children, submenu } = $$props;

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		const posts = $.derived(() => data.posts?.posts ?? {});

		const builders = $.derived(() => data.posts?.builders ?? []);
		const blocks = ["quickstart", "application", "marketing", "publisher"];
		const drawerHidden = getContext("drawer");
		let noToc = $.derived(() => ["blocks", "builder"].includes(submenu ?? ""));
		const sidebarUi = uiHelpers();
		let isOpen = true;
		const closeSidebar = sidebarUi.close;
		const names_mapping = { pages: "Getting Started" };
		let mainSidebarUrl = $.derived(() => page.url.pathname);

		// Create state variables for each dropdown
		let dropdownStates = {};

		// Update dropdown states based on current route
		// Check each post category
		// Check builders
		// Check blocks
		afterNavigate(() => {
			// this fixes https://github.com/themesberg/flowbite-svelte/issues/364
			document.getElementById("svelte")?.scrollTo({ top: 0 });

			closeSidebar();
		});

		let spanClass = "";
		let mainClass = "fixed inset-0 z-40 lg:z-39 flex-none h-full w-64 lg:static lg:h-auto border-e border-gray-200 dark:border-gray-600 lg:overflow-y-visible lg:pt-0 lg:block bg-white dark:bg-gray-900";
		let nonActiveClass = "text-sm transition-colors duration-200 relative font-medium hover:text-gray-900 hover:bg-transparent dark:hover:bg-transparent hover:cursor-pointer text-gray-500 dark:text-gray-400 dark:hover:text-white";
		let activeClass = "text-sm relative font-medium cursor-default bg-transparent dark:bg-transparent hover:bg-transparent dark:hover:bg-transparent text-primary-700 dark:text-primary-700";
		let btnClass = "my-0 text-sm font-semibold tracking-wide uppercase text-gray-700 dark:text-gray-200 hover:bg-transparent dark:hover:bg-transparent hover:text-primary-700 dark:hover:text-primary-600";
		let divClass = "overflow-y-auto px-4 pt-20 lg:pt-4 h-full scrolling-touch max-w-2xs lg:h-[calc(100vh-8rem)] lg:block lg:me-0 lg:sticky top-20 bg-white dark:bg-gray-900";

		// const blockCls = "px-4 mx-auto max-w-8xl";
		const nonBlockCls = "min-w-0 lg:static lg:container lg:mx-auto lg:max-h-full lg:overflow-visible";

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (submenu !== "blocks") {
				$$renderer.push('<!--[0-->');

				SidebarButton($$renderer, {
					breakpoint: 'lg',
					onclick: sidebarUi.toggle,
					class: 'fixed top-2 z-40 mb-2 md:top-4'
				});

				$$renderer.push(`<!----> `);

				Sidebar($$renderer, {
					breakpoint: 'lg',
					backdrop: true,
					isSingle: false,
					isOpen,
					closeSidebar,
					classes: {
						div: divClass,
						nonactive: nonActiveClass,
						active: activeClass
					},
					activeUrl: mainSidebarUrl(),
					class: mainClass,
					params: { x: -50, duration: 50 },
					children: ($$renderer) => {
						$$renderer.push(`<h4 id="sidebar-label" class="sr-only">Browse docs</h4> `);

						SidebarGroup($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(Object.entries(posts()));

								for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
									let [key, values] = each_array[$$index_1];

									SidebarDropdownWrapper($$renderer, {
										label: names_mapping[key] ?? key,
										classes: { btn: btnClass, ul: "space-y-0 p-0" },
										class: dropdownStates[key]
											? "text-primary-700 dark:text-primary-700"
											: "text-gray-700 dark:text-gray-200",

										get isOpen() {
											return dropdownStates[key];
										},

										set isOpen($$value) {
											dropdownStates[key] = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_1 = $.ensure_array_like(values);

											for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
												let { meta, path } = each_array_1[$$index];

												if (meta?.component_title) {
													$$renderer.push('<!--[0-->');

													const href = key === "icons" || key === "illustrations" ? `/${key}${path}` : `/docs/${key}${path}`;

													SidebarItem($$renderer, { label: meta.component_title, href, spanClass });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]--> `);

								if (builders().length) {
									$$renderer.push('<!--[0-->');

									SidebarDropdownWrapper($$renderer, {
										label: 'Builders',
										classes: { btn: btnClass, ul: "space-y-0 p-0" },
										class: dropdownStates["builders"]
											? "text-primary-700 dark:text-primary-700"
											: "text-gray-700 dark:text-gray-200",

										get isOpen() {
											return dropdownStates["builders"];
										},

										set isOpen($$value) {
											dropdownStates["builders"] = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_2 = $.ensure_array_like(builders());

											for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
												let builder = each_array_2[$$index_2];
												const pathWithoutSlash = builder.path.replace(/^\//, "");
												const capitalizedPath = pathWithoutSlash.charAt(0).toUpperCase() + pathWithoutSlash.slice(1);
												const href = `/builder/${builder.path}`;

												SidebarItem($$renderer, { label: capitalizedPath, href, spanClass });
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								SidebarDropdownWrapper($$renderer, {
									label: 'Blocks',
									classes: { btn: btnClass, ul: "space-y-0 p-0" },
									class: dropdownStates["blocks"]
										? "text-primary-700 dark:text-primary-700"
										: "text-gray-700 dark:text-gray-200",

									get isOpen() {
										return dropdownStates["blocks"];
									},

									set isOpen($$value) {
										dropdownStates["blocks"] = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array_3 = $.ensure_array_like(blocks);

										for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
											let block = each_array_3[$$index_3];

											SidebarItem($$renderer, {
												label: capitalizeFirstLetter(block),
												href: `/blocks/${$.stringify(block)}`,
												spanClass
											});
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								SidebarItem($$renderer, {
									label: 'Admin Dashboard',
									href: '/admin-dashboard',
									spanClass: 'ms-3 w-full text-sm font-semibold tracking-wide uppercase hover:text-primary-700 dark:hover:text-primary-600 text-gray-700 dark:text-gray-200',
									activeClass
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attr('hidden', $.store_get($$store_subs ??= {}, '$drawerHidden', drawerHidden))} class="static inset-0 z-20 bg-gray-900/50 dark:bg-gray-900/60" role="presentation"></div> `);

			if (noToc()) {
				$$renderer.push(`<!--[0--><main class="max-w-8xl mx-auto min-w-0 flex-auto pb-40 lg:static lg:max-h-full lg:overflow-visible">`);
				children($$renderer);
				$$renderer.push(`<!----></main>`);
			} else {
				$$renderer.push(`<!--[-1--><main${$.attr_class($.clsx(nonBlockCls))}>`);
				children($$renderer);
				$$renderer.push(`<!----></main> `);
				Toc($$renderer, { extract, headingSelector: '#mainContent > :where(h2, h3)' });
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}