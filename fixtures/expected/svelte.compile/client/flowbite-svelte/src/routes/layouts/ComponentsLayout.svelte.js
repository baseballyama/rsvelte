import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<h4 id="sidebar-label" class="sr-only">Browse docs</h4> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<main class="max-w-8xl mx-auto min-w-0 flex-auto pb-40 lg:static lg:max-h-full lg:overflow-visible"><!></main>`);
var root_4 = $.from_html(`<main><!></main> <!>`, 1);
var root_5 = $.from_html(`<!> <div class="static inset-0 z-20 bg-gray-900/50 dark:bg-gray-900/60" role="presentation"></div> <!>`, 1);

export default function ComponentsLayout($$anchor, $$props) {
	$.push($$props, true);

	const $drawerHidden = () => $.store_get(drawerHidden, '$drawerHidden', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	/* eslint-disable  @typescript-eslint/no-explicit-any */
	const posts = $.derived(() => $$props.data.posts?.posts ?? {});

	const builders = $.derived(() => $$props.data.posts?.builders ?? []);
	const blocks = ["quickstart", "application", "marketing", "publisher"];
	const drawerHidden = getContext("drawer");
	let noToc = $.derived(() => ["blocks", "builder"].includes($$props.submenu ?? ""));
	const sidebarUi = uiHelpers();
	let isOpen = $.state(true);
	const closeSidebar = sidebarUi.close;

	$.user_effect(() => {
		$.set(isOpen, sidebarUi.isOpen, true);
	});

	const names_mapping = { pages: "Getting Started" };
	let mainSidebarUrl = $.derived(() => page.url.pathname);

	// Create state variables for each dropdown
	let dropdownStates = $.state($.proxy({}));

	// Update dropdown states based on current route
	$.user_effect(() => {
		const states = {};

		// Check each post category
		for (const key in $.get(posts)) {
			const paths = $.get(posts)[key].map((item) => key === "icons" || key === "illustrations" ? `/${key}${item.path}` : `/docs/${key}${item.path}`);

			states[key] = paths.some((path) => $.get(mainSidebarUrl).startsWith(path));
		}

		// Check builders
		if ($.get(builders).length) {
			const builderPaths = $.get(builders).map((b) => `/builder/${b.path}`);

			states["builders"] = builderPaths.some((path) => $.get(mainSidebarUrl).startsWith(path));
		}

		// Check blocks
		states["blocks"] = blocks.some((block) => $.get(mainSidebarUrl).startsWith(`/blocks/${block}`));

		$.set(dropdownStates, states, true);
	});

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

	var fragment = root_5();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			SidebarButton(node_1, {
				breakpoint: 'lg',
				get onclick() {
					return sidebarUi.toggle;
				},
				class: 'fixed top-2 z-40 mb-2 md:top-4'
			});

			var node_2 = $.sibling(node_1, 2);

			Sidebar(node_2, {
				breakpoint: 'lg',
				backdrop: true,
				isSingle: false,
				get isOpen() {
					return $.get(isOpen);
				},

				get closeSidebar() {
					return closeSidebar;
				},

				classes: {
					div: divClass,
					nonactive: nonActiveClass,
					active: activeClass
				},

				get activeUrl() {
					return $.get(mainSidebarUrl);
				},
				class: mainClass,
				params: { x: -50, duration: 50 },
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_3 = $.sibling($.first_child(fragment_2), 2);

					SidebarGroup(node_3, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, () => Object.entries($.get(posts)), ([key, values]) => key, ($$anchor, $$item) => {
								var $$array = $.derived(() => $.to_array($.get($$item), 2));
								let key = () => $.get($$array)[0];
								let values = () => $.get($$array)[1];

								{
									let $0 = $.derived(() => names_mapping[key()] ?? key());

									let $1 = $.derived(() => $.get(dropdownStates)[key()]
										? "text-primary-700 dark:text-primary-700"
										: "text-gray-700 dark:text-gray-200");

									SidebarDropdownWrapper($$anchor, {
										get label() {
											return $.get($0);
										},
										classes: { btn: btnClass, ul: "space-y-0 p-0" },
										get class() {
											return $.get($1);
										},

										get isOpen() {
											return $.get(dropdownStates)[key()];
										},

										set isOpen($$value) {
											$.get(dropdownStates)[key()] = $$value;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											$.each(node_5, 17, values, $.index, ($$anchor, $$item) => {
												let meta = () => $.get($$item).meta;
												let path = () => $.get($$item).path;
												var fragment_6 = $.comment();
												var node_6 = $.first_child(fragment_6);

												{
													var consequent = ($$anchor) => {
														const href = $.derived(() => key() === "icons" || key() === "illustrations" ? `/${key()}${path()}` : `/docs/${key()}${path()}`);

														SidebarItem($$anchor, {
															get label() {
																return meta().component_title;
															},

															get href() {
																return $.get(href);
															},
															spanClass
														});
													};

													$.if(node_6, ($$render) => {
														if (meta()?.component_title) $$render(consequent);
													});
												}

												$.append($$anchor, fragment_6);
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								}
							});

							var node_7 = $.sibling(node_4, 2);

							{
								var consequent_1 = ($$anchor) => {
									{
										let $0 = $.derived(() => $.get(dropdownStates)["builders"]
											? "text-primary-700 dark:text-primary-700"
											: "text-gray-700 dark:text-gray-200");

										SidebarDropdownWrapper($$anchor, {
											label: 'Builders',
											classes: { btn: btnClass, ul: "space-y-0 p-0" },
											get class() {
												return $.get($0);
											},

											get isOpen() {
												return $.get(dropdownStates)["builders"];
											},

											set isOpen($$value) {
												$.get(dropdownStates)["builders"] = $$value;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_8 = $.first_child(fragment_9);

												$.each(node_8, 17, () => $.get(builders), $.index, ($$anchor, builder) => {
													const pathWithoutSlash = $.derived(() => $.get(builder).path.replace(/^\//, ""));
													const capitalizedPath = $.derived(() => $.get(pathWithoutSlash).charAt(0).toUpperCase() + $.get(pathWithoutSlash).slice(1));
													const href = $.derived(() => `/builder/${$.get(builder).path}`);

													SidebarItem($$anchor, {
														get label() {
															return $.get(capitalizedPath);
														},

														get href() {
															return $.get(href);
														},
														spanClass
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									}
								};

								$.if(node_7, ($$render) => {
									if ($.get(builders).length) $$render(consequent_1);
								});
							}

							var node_9 = $.sibling(node_7, 2);

							{
								let $0 = $.derived(() => $.get(dropdownStates)["blocks"]
									? "text-primary-700 dark:text-primary-700"
									: "text-gray-700 dark:text-gray-200");

								SidebarDropdownWrapper(node_9, {
									label: 'Blocks',
									classes: { btn: btnClass, ul: "space-y-0 p-0" },
									get class() {
										return $.get($0);
									},

									get isOpen() {
										return $.get(dropdownStates)["blocks"];
									},

									set isOpen($$value) {
										$.get(dropdownStates)["blocks"] = $$value;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_11 = $.comment();
										var node_10 = $.first_child(fragment_11);

										$.each(node_10, 17, () => blocks, $.index, ($$anchor, block) => {
											{
												let $0 = $.derived(() => capitalizeFirstLetter($.get(block)));

												SidebarItem($$anchor, {
													get label() {
														return $.get($0);
													},

													get href() {
														return `/blocks/${$.get(block) ?? ''}`;
													},
													spanClass
												});
											}
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							}

							var node_11 = $.sibling(node_9, 2);

							SidebarItem(node_11, {
								label: 'Admin Dashboard',
								href: '/admin-dashboard',
								spanClass: 'ms-3 w-full text-sm font-semibold tracking-wide uppercase hover:text-primary-700 dark:hover:text-primary-600 text-gray-700 dark:text-gray-200',
								activeClass
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.submenu !== "blocks") $$render(consequent_2);
		});
	}

	var div = $.sibling(node, 2);
	var node_12 = $.sibling(div, 2);

	{
		var consequent_3 = ($$anchor) => {
			var main = root_3();
			var node_13 = $.child(main);

			$.snippet(node_13, () => $$props.children);
			$.reset(main);
			$.append($$anchor, main);
		};

		var alternate = ($$anchor) => {
			var fragment_13 = root_4();
			var main_1 = $.first_child(fragment_13);

			$.set_class(main_1, 1, $.clsx(nonBlockCls));

			var node_14 = $.child(main_1);

			$.snippet(node_14, () => $$props.children);
			$.reset(main_1);

			var node_15 = $.sibling(main_1, 2);

			Toc(node_15, {
				get extract() {
					return extract;
				},
				headingSelector: '#mainContent > :where(h2, h3)'
			});

			$.append($$anchor, fragment_13);
		};

		$.if(node_12, ($$render) => {
			if ($.get(noToc)) $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	$.template_effect(() => $.set_attribute(div, 'hidden', $drawerHidden()));
	$.delegated('click', div, closeSidebar);
	$.delegated('keydown', div, closeSidebar);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'keydown']);