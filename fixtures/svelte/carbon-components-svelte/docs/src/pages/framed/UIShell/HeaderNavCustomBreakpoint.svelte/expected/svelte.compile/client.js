import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Column,
	Content,
	Grid,
	Header,
	HeaderNav,
	HeaderNavItem,
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
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

var root_2 = $.from_html(
	`<h1>Custom Breakpoint (Infinity)</h1> <p>By default the side nav expands and the hamburger hides at 1056px and
          above. Here, the hamburger is always visible and the side nav stays
          collapsed with overlay at all viewport sizes. When opened, the overlay
          appears behind the side nav.</p>`,
	1
);

export default function HeaderNavCustomBreakpoint($$anchor) {
	let isSideNavOpen = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'IBM',
		platformName: 'Cloud',
		expansionBreakpoint: Number.POSITIVE_INFINITY,
		get isSideNavOpen() {
			return isSideNavOpen;
		},

		set isSideNavOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			HeaderNav($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					HeaderNavItem(node_1, { href: '/catalog', text: 'Catalog' });

					var node_2 = $.sibling(node_1, 2);

					HeaderNavItem(node_2, { href: '/docs', text: 'Docs' });

					var node_3 = $.sibling(node_2, 2);

					HeaderNavItem(node_3, { href: '/support', text: 'Support' });
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

	var node_4 = $.sibling(node, 2);

	SideNav(node_4, {
		expansionBreakpoint: Number.POSITIVE_INFINITY,
		get isOpen() {
			return isSideNavOpen;
		},

		set isOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			SideNavItems($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_5 = $.first_child(fragment_5);

					SideNavLink(node_5, { href: '/dashboard', text: 'Dashboard' });

					var node_6 = $.sibling(node_5, 2);

					SideNavLink(node_6, { href: '/resources', text: 'Resource list' });

					var node_7 = $.sibling(node_6, 2);

					SideNavLink(node_7, { href: '/activity', text: 'Activity tracker' });

					var node_8 = $.sibling(node_7, 2);

					SideNavMenu(node_8, {
						text: 'Kubernetes',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_9 = $.first_child(fragment_6);

							SideNavMenuItem(node_9, { href: '/kubernetes/clusters', text: 'Clusters' });

							var node_10 = $.sibling(node_9, 2);

							SideNavMenuItem(node_10, { href: '/kubernetes/worker-pools', text: 'Worker pools' });

							var node_11 = $.sibling(node_10, 2);

							SideNavMenuItem(node_11, { href: '/kubernetes/registry', text: 'Container registry' });
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_8, 2);

					SideNavDivider(node_12, {});

					var node_13 = $.sibling(node_12, 2);

					SideNavLink(node_13, { href: '/settings', text: 'Account settings' });
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_4, 2);

	Content(node_14, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_2();

									$.next(2);
									$.append($$anchor, fragment_10);
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