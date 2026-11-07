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
	SkipToContent
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1>Dashboard</h1>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Header_1($$anchor) {
	let isSideNavOpen = false;
	var fragment = root_3();
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

	var node_8 = $.sibling(node, 2);

	Content(node_8, {
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