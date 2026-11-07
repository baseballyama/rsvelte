import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Column,
	Content,
	Grid,
	Header,
	HeaderNav,
	HeaderNavItem,
	HeaderNavMenu,
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
var root_3 = $.from_html(`<h1>Dashboard</h1>`);

export default function HeaderNav_1($$anchor) {
	let isSideNavOpen = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'IBM',
		platformName: 'Cloud',
		get isSideNavOpen() {
			return isSideNavOpen;
		},

		set isSideNavOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			HeaderNav($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					HeaderNavItem(node_1, { href: '/catalog', text: 'Catalog' });

					var node_2 = $.sibling(node_1, 2);

					HeaderNavItem(node_2, { href: '/docs', text: 'Docs' });

					var node_3 = $.sibling(node_2, 2);

					HeaderNavItem(node_3, { href: '/support', text: 'Support' });

					var node_4 = $.sibling(node_3, 2);

					HeaderNavMenu(node_4, {
						text: 'Manage',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							HeaderNavItem(node_5, { href: '/account', text: 'Account' });

							var node_6 = $.sibling(node_5, 2);

							HeaderNavItem(node_6, { href: '/iam', text: 'Access (IAM)' });

							var node_7 = $.sibling(node_6, 2);

							HeaderNavItem(node_7, { href: '/billing', text: 'Billing and usage' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_4, 2);

					HeaderNavItem(node_8, { href: '/status', text: 'Status' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			skipToContent: ($$anchor, $$slotProps) => {
				SkipToContent($$anchor, {});
			}
		}
	});

	var node_9 = $.sibling(node, 2);

	SideNav(node_9, {
		get isOpen() {
			return isSideNavOpen;
		},

		set isOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			SideNavItems($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_2();
					var node_10 = $.first_child(fragment_6);

					SideNavLink(node_10, { href: '/dashboard', text: 'Dashboard', isSelected: true });

					var node_11 = $.sibling(node_10, 2);

					SideNavLink(node_11, { href: '/resources', text: 'Resource list' });

					var node_12 = $.sibling(node_11, 2);

					SideNavLink(node_12, { href: '/activity', text: 'Activity tracker' });

					var node_13 = $.sibling(node_12, 2);

					SideNavMenu(node_13, {
						text: 'Kubernetes',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_14 = $.first_child(fragment_7);

							SideNavMenuItem(node_14, { href: '/kubernetes/clusters', text: 'Clusters' });

							var node_15 = $.sibling(node_14, 2);

							SideNavMenuItem(node_15, { href: '/kubernetes/worker-pools', text: 'Worker pools' });

							var node_16 = $.sibling(node_15, 2);

							SideNavMenuItem(node_16, { href: '/kubernetes/registry', text: 'Container registry' });
							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_13, 2);

					SideNavDivider(node_17, {});

					var node_18 = $.sibling(node_17, 2);

					SideNavLink(node_18, { href: '/settings', text: 'Account settings' });
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_9, 2);

	Content(node_19, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var h1 = root_3();

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