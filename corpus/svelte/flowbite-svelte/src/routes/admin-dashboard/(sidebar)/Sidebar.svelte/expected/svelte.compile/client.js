import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate } from "$app/navigation";

import {
	Sidebar,
	SidebarDropdownWrapper,
	SidebarGroup,
	SidebarItem,
	SidebarWrapper,
	SidebarButton,
	uiHelpers
} from "flowbite-svelte";

import {
	AngleDownOutline,
	AngleUpOutline,
	ClipboardListSolid,
	CogOutline,
	FileChartBarSolid,
	GithubSolid,
	LayersSolid,
	LifeSaverSolid,
	LockSolid,
	WandMagicSparklesOutline,
	ChartPieOutline,
	RectangleListSolid,
	TableColumnSolid,
	GridSolid
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<h4 class="sr-only">Main menu</h4> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Sidebar_1($$anchor, $$props) {
	$.push($$props, true);

	let drawerHidden = $.prop($$props, 'drawerHidden', 15, false);

	const closeDrawer = () => {
		drawerHidden(true);
	};

	let iconClass = "flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white";
	let itemClass = "flex items-center p-0 text-base text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group dark:text-gray-200 dark:hover:bg-gray-700 w-full";
	let groupClass = "space-y-2";
	const sidebarUi = uiHelpers();
	let isOpen = $.state(false);
	const closeSidebar = sidebarUi.close;

	$.user_effect(() => {
		$.set(isOpen, sidebarUi.isOpen, true);
	});

	afterNavigate(() => {
		// this fixes https://github.com/themesberg/flowbite-svelte/issues/364
		document.getElementById("svelte")?.scrollTo({ top: 0 });

		closeDrawer();
	});

	let posts = [
		{
			name: "Dashboard",
			Icon: ChartPieOutline,
			href: "/admin-dashboard/dashboard"
		},

		{
			name: "Layouts",
			Icon: TableColumnSolid,
			children: {
				Stacked: "/admin-dashboard/layouts/stacked",
				Sidebar: "/admin-dashboard/layouts/sidebar"
			}
		},

		{
			name: "CRUD",
			Icon: RectangleListSolid,
			children: {
				Products: "/admin-dashboard/crud/products",
				Users: "/admin-dashboard/crud/users"
			}
		},

		{
			name: "Settings",
			Icon: CogOutline,
			href: "/admin-dashboard/settings"
		},

		{
			name: "Pages",
			Icon: FileChartBarSolid,
			children: {
				Pricing: "/admin-dashboard/pages/pricing",
				Maintenance: "/admin-dashboard/errors/400",
				"404 not found": "/admin-dashboard/errors/404",
				"500 server error": "/admin-dashboard/errors/500"
			}
		},

		{
			name: "Authentication",
			Icon: LockSolid,
			children: {
				"Sign in": "/admin-dashboard/authentication/sign-in",
				"Sign up": "/admin-dashboard/authentication/sign-up",
				"Forgot password": "/admin-dashboard/authentication/forgot-password",
				"Reset password": "/admin-dashboard/authentication/reset-password",
				"Profile lock": "/admin-dashboard/authentication/profile-lock"
			}
		},

		{
			name: "Playground",
			Icon: WandMagicSparklesOutline,
			children: {
				Stacked: "/admin-dashboard/playground/stacked",
				Sidebar: "/admin-dashboard/playground/sidebar"
			}
		}
	];

	let links = [
		{
			label: "GitHub Repository",
			href: "https://github.com/themesberg/flowbite-svelte-admin-dashboard",
			Icon: GithubSolid
		},

		{
			label: "Flowbite Svelte",
			href: "https://flowbite-svelte.com/docs/pages/quickstart",
			Icon: ClipboardListSolid
		},

		{
			label: "Components",
			href: "/admin-dashboard/components/productdrawer",
			Icon: LayersSolid
		},

		{
			label: "Support",
			href: "https://github.com/themesberg/flowbite-svelte-admin-dashboard/issues",
			Icon: LifeSaverSolid
		}
	];

	var fragment = root_2();
	var node = $.first_child(fragment);

	SidebarButton(node, {
		breakpoint: 'lg',
		get onclick() {
			return sidebarUi.toggle;
		},
		class: 'fixed top-[22px] z-40 mb-2'
	});

	var node_1 = $.sibling(node, 2);

	Sidebar(node_1, {
		breakpoint: 'lg',
		backdrop: false,
		get isOpen() {
			return $.get(isOpen);
		},

		get closeSidebar() {
			return closeSidebar;
		},
		params: { x: -50, duration: 50 },
		class: 'top-0 left-0 mt-[69px] h-screen w-64 bg-gray-50 transition-transform lg:block dark:bg-gray-800',
		classes: {
			div: "h-full px-1 py-1 overflow-y-auto bg-gray-50 dark:bg-gray-800",
			nonactive: "p-2 group-has-[ul]:ms-0",
			active: "p-2 group-has-[ul]:ms-0"
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.sibling($.first_child(fragment_1), 2);

			SidebarWrapper(node_2, {
				class: 'scrolling-touch h-full max-w-2xs overflow-y-auto bg-white px-3 pt-20 lg:sticky lg:me-0 lg:block lg:h-[calc(100vh-4rem)] lg:pt-5 dark:bg-gray-800',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					SidebarGroup(node_3, {
						class: groupClass,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, () => posts, ({ name, Icon, children, href }) => name, ($$anchor, $$item) => {
								let name = () => $.get($$item).name;
								let Icon = () => $.get($$item).Icon;
								let children = () => $.get($$item).children;
								let href = () => $.get($$item).href;
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										{
											const arrowdown = ($$anchor) => {
												AngleDownOutline($$anchor, { strokeWidth: '3.3', size: 'sm' });
											};

											const arrowup = ($$anchor) => {
												AngleUpOutline($$anchor, { strokeWidth: '3.3', size: 'sm' });
											};

											const icon = ($$anchor) => {
												var fragment_8 = $.comment();
												var node_6 = $.first_child(fragment_8);

												$.component(node_6, Icon, ($$anchor, Icon_1) => {
													Icon_1($$anchor, { class: iconClass });
												});

												$.append($$anchor, fragment_8);
											};

											SidebarDropdownWrapper($$anchor, {
												get label() {
													return name();
												},
												class: 'pr-3',
												arrowdown,
												arrowup,
												icon,
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_7 = $.first_child(fragment_9);

													$.each(node_7, 17, () => Object.entries(children()), $.index, ($$anchor, $$item, $$index, $$array) => {
														var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
														let title = () => $.get($$array_1)[0];
														let href = () => $.get($$array_1)[1];

														SidebarItem($$anchor, {
															get label() {
																return title();
															},

															get href() {
																return href();
															},
															spanClass: 'ml-9',
															class: itemClass,
															aClass: 'w-full'
														});
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { arrowdown: true, arrowup: true, icon: true, default: true }
											});
										}
									};

									var alternate = ($$anchor) => {
										{
											const icon = ($$anchor) => {
												var fragment_12 = $.comment();
												var node_8 = $.first_child(fragment_12);

												$.component(node_8, Icon, ($$anchor, Icon_2) => {
													Icon_2($$anchor, { class: iconClass });
												});

												$.append($$anchor, fragment_12);
											};

											SidebarItem($$anchor, {
												get label() {
													return name();
												},

												get href() {
													return href();
												},
												spanClass: 'ml-3',
												class: itemClass,
												aClass: 'w-full p-0 py-2',
												icon,
												$$slots: { icon: true }
											});
										}
									};

									$.if(node_5, ($$render) => {
										if (children()) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_3, 2);

					SidebarGroup(node_9, {
						class: groupClass,
						children: ($$anchor, $$slotProps) => {
							{
								const icon = ($$anchor) => {
									GridSolid($$anchor, {
										class: 'h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white'
									});
								};

								SidebarItem($$anchor, {
									label: 'Quickstart',
									spanClass: 'ms-3',
									href: '/admin-dashboard/quickstart',
									icon,
									$$slots: { icon: true }
								});
							}
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					SidebarGroup(node_10, {
						class: groupClass,
						children: ($$anchor, $$slotProps) => {
							var fragment_15 = $.comment();
							var node_11 = $.first_child(fragment_15);

							$.each(node_11, 17, () => links, ({ label, href, Icon }) => label, ($$anchor, $$item) => {
								let label = () => $.get($$item).label;
								let href = () => $.get($$item).href;
								let Icon = () => $.get($$item).Icon;

								{
									const icon = ($$anchor) => {
										var fragment_17 = $.comment();
										var node_12 = $.first_child(fragment_17);

										$.component(node_12, Icon, ($$anchor, Icon_3) => {
											Icon_3($$anchor, { class: iconClass });
										});

										$.append($$anchor, fragment_17);
									};

									SidebarItem($$anchor, {
										get label() {
											return label();
										},

										get href() {
											return href();
										},
										spanClass: 'ml-3',
										class: itemClass,
										icon,
										$$slots: { icon: true }
									});
								}
							});

							$.append($$anchor, fragment_15);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}