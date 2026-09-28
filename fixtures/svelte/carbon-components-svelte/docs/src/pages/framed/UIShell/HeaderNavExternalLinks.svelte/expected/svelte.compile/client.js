import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Column,
	Content,
	Grid,
	Header,
	HeaderNav,
	HeaderNavItem,
	HeaderSideNavItems,
	Row,
	SideNav,
	SideNavItems,
	SideNavLink,
	SkipToContent
} from "carbon-components-svelte";

import Launch from "carbon-icons-svelte/lib/Launch.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1>Dashboard</h1>`);

export default function HeaderNavExternalLinks($$anchor) {
	let isSideNavOpen = false;
	var fragment = root_1();
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
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					HeaderNavItem(node_1, { href: '/catalog', text: 'Catalog' });

					var node_2 = $.sibling(node_1, 2);

					HeaderNavItem(node_2, { href: '/resources', text: 'Resource list' });

					var node_3 = $.sibling(node_2, 2);

					HeaderNavItem(node_3, {
						href: 'https://cloud.ibm.com/docs',
						target: '_blank',
						text: 'Docs',
						get icon() {
							return Launch;
						}
					});

					var node_4 = $.sibling(node_3, 2);

					HeaderNavItem(node_4, {
						href: 'https://cloud.ibm.com/status',
						target: '_blank',
						text: 'Status',
						get icon() {
							return Launch;
						}
					});

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

	var node_5 = $.sibling(node, 2);

	SideNav(node_5, {
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
					var node_6 = $.first_child(fragment_5);

					HeaderSideNavItems(node_6, {
						hasDivider: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_7 = $.first_child(fragment_6);

							HeaderNavItem(node_7, { href: '/catalog', text: 'Catalog' });

							var node_8 = $.sibling(node_7, 2);

							HeaderNavItem(node_8, { href: '/resources', text: 'Resource list' });

							var node_9 = $.sibling(node_8, 2);

							HeaderNavItem(node_9, {
								href: 'https://cloud.ibm.com/docs',
								target: '_blank',
								text: 'Docs',
								get icon() {
									return Launch;
								}
							});

							var node_10 = $.sibling(node_9, 2);

							HeaderNavItem(node_10, {
								href: 'https://cloud.ibm.com/status',
								target: '_blank',
								text: 'Status',
								get icon() {
									return Launch;
								}
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_6, 2);

					SideNavLink(node_11, { href: '/dashboard', text: 'Dashboard', isSelected: true });

					var node_12 = $.sibling(node_11, 2);

					SideNavLink(node_12, { href: '/activity', text: 'Activity tracker' });
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_5, 2);

	Content(node_13, {
		children: ($$anchor, $$slotProps) => {
			Grid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Column($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var h1 = root_2();

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