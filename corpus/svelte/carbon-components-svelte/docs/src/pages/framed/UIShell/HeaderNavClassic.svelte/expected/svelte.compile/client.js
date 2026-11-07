import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Column,
	Content,
	Grid,
	Header,
	HeaderAction,
	HeaderNav,
	HeaderNavItem,
	HeaderNavMenu,
	HeaderPanelDivider,
	HeaderPanelLink,
	HeaderPanelLinks,
	HeaderUtilities,
	Row,
	SideNav,
	SideNavDivider,
	SideNavItems,
	SideNavLink,
	SideNavMenu,
	SideNavMenuItem,
	SkipToContent
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<h1>Dashboard</h1>`);

export default function HeaderNavClassic($$anchor) {
	let isSideNavOpen = false;
	let isOpen = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'IBM',
		platformName: 'Cloud',
		theme: 'classic',
		get isSideNavOpen() {
			return isSideNavOpen;
		},

		set isSideNavOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node_1 = $.first_child(fragment_1);

			HeaderNav(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_2 = $.first_child(fragment_2);

					HeaderNavItem(node_2, { href: '/catalog', text: 'Catalog' });

					var node_3 = $.sibling(node_2, 2);

					HeaderNavItem(node_3, { href: '/docs', text: 'Docs' });

					var node_4 = $.sibling(node_3, 2);

					HeaderNavItem(node_4, { href: '/support', text: 'Support' });

					var node_5 = $.sibling(node_4, 2);

					HeaderNavMenu(node_5, {
						text: 'Manage',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_6 = $.first_child(fragment_3);

							HeaderNavItem(node_6, { href: '/account', text: 'Account' });

							var node_7 = $.sibling(node_6, 2);

							HeaderNavItem(node_7, { href: '/iam', text: 'Access (IAM)' });

							var node_8 = $.sibling(node_7, 2);

							HeaderNavItem(node_8, { href: '/billing', text: 'Billing and usage' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_5, 2);

					HeaderNavItem(node_9, { href: '/status', text: 'Status' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_1, 2);

			HeaderUtilities(node_10, {
				children: ($$anchor, $$slotProps) => {
					HeaderAction($$anchor, {
						get isOpen() {
							return isOpen;
						},

						set isOpen($$value) {
							isOpen = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							HeaderPanelLinks($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_11 = $.first_child(fragment_6);

									HeaderPanelDivider(node_11, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Switch product');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_11, 2);

									HeaderPanelLink(node_12, {
										href: '/cloud',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Cloud console');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									var node_13 = $.sibling(node_12, 2);

									HeaderPanelDivider(node_13, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Resources');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									HeaderPanelLink(node_14, {
										href: '/docs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Documentation');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_15 = $.sibling(node_14, 2);

									HeaderPanelLink(node_15, {
										href: '/status',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Status page');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_16 = $.sibling(node_15, 2);

									HeaderPanelLink(node_16, {
										href: '/community',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Community');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			skipToContent: ($$anchor, $$slotProps) => {
				SkipToContent($$anchor, {});
			}
		}
	});

	var node_17 = $.sibling(node, 2);

	SideNav(node_17, {
		theme: 'classic',
		get isOpen() {
			return isSideNavOpen;
		},

		set isOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			SideNavItems($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_2();
					var node_18 = $.first_child(fragment_9);

					SideNavLink(node_18, { href: '/dashboard', text: 'Dashboard' });

					var node_19 = $.sibling(node_18, 2);

					SideNavLink(node_19, { href: '/resources', text: 'Resource list' });

					var node_20 = $.sibling(node_19, 2);

					SideNavLink(node_20, { href: '/activity', text: 'Activity tracker' });

					var node_21 = $.sibling(node_20, 2);

					SideNavMenu(node_21, {
						text: 'Kubernetes',
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root();
							var node_22 = $.first_child(fragment_10);

							SideNavMenuItem(node_22, { href: '/kubernetes/clusters', text: 'Clusters' });

							var node_23 = $.sibling(node_22, 2);

							SideNavMenuItem(node_23, { href: '/kubernetes/worker-pools', text: 'Worker pools' });

							var node_24 = $.sibling(node_23, 2);

							SideNavMenuItem(node_24, { href: '/kubernetes/registry', text: 'Container registry' });
							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_21, 2);

					SideNavDivider(node_25, {});

					var node_26 = $.sibling(node_25, 2);

					SideNavLink(node_26, { href: '/settings', text: 'Account settings' });
					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_27 = $.sibling(node_17, 2);

	Content(node_27, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var h1 = root_4();

									$.append($$anchor, h1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}