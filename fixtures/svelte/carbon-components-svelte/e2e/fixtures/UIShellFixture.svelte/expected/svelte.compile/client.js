import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Content,
	Header,
	HeaderNav,
	HeaderNavItem,
	HeaderNavMenu,
	HeaderSearch,
	HeaderUtilities,
	ProfileMenu,
	ProfileMenuDetail,
	ProfileMenuDivider,
	ProfileMenuHeader,
	ProfileMenuItem,
	SideNav,
	SideNavItems,
	SideNavLink,
	SkipToContent
} from "carbon-components-svelte";

var root = $.from_html(`<a slot="action" href="#">Upgrade</a>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div slot="skipToContent"><!></div>`);
var root_4 = $.from_html(`<p data-testid="main-paragraph">Primary page content</p> <button data-testid="outside-header-search" type="button">Dismiss region</button>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);

export default function UIShellFixture($$anchor) {
	let isSideNavOpen = false;

	const searchResults = [
		{ href: "#", text: "Result one", description: "First" },
		{ href: "#", text: "Result two" }
	];

	var fragment = root_5();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'E2E',
		platformName: 'UIShell',
		get isSideNavOpen() {
			return isSideNavOpen;
		},

		set isSideNavOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			HeaderUtilities(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node_2 = $.first_child(fragment_2);

					HeaderSearch(node_2, {
						get results() {
							return searchResults;
						}
					});

					var node_3 = $.sibling(node_2, 2);

					ProfileMenu(node_3, {
						iconDescription: 'Profile',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_4 = $.first_child(fragment_3);

							ProfileMenuHeader(node_4, { name: 'Sadek Bazaraa', username: 'sbazaraa', href: '#' });

							var node_5 = $.sibling(node_4, 2);

							ProfileMenuDivider(node_5, {});

							var node_6 = $.sibling(node_5, 2);

							ProfileMenuDetail(node_6, {
								label: 'Plan',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Lite');

									$.append($$anchor, text);
								},

								$$slots: {
									default: true,
									action: ($$anchor, $$slotProps) => {
										var a = root();

										$.append($$anchor, a);
									}
								}
							});

							var node_7 = $.sibling(node_6, 2);

							ProfileMenuDivider(node_7, {});

							var node_8 = $.sibling(node_7, 2);

							ProfileMenuItem(node_8, {
								href: '#',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Settings');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							ProfileMenuItem(node_9, {
								$$events: { click: () => {} },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Log out');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_1, 2);

			HeaderNav(node_10, {
				'aria-label': 'Top navigation',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_2();
					var node_11 = $.first_child(fragment_4);

					HeaderNavItem(node_11, { href: '#', text: 'Nav link' });

					var node_12 = $.sibling(node_11, 2);

					HeaderNavMenu(node_12, {
						href: '#',
						text: 'Submenu',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_13 = $.first_child(fragment_5);

							HeaderNavItem(node_13, { href: '#', text: 'Sub link one' });

							var node_14 = $.sibling(node_13, 2);

							HeaderNavItem(node_14, { href: '#', text: 'Sub link two' });
							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			skipToContent: ($$anchor, $$slotProps) => {
				var div = root_3();
				var node_15 = $.child(div);

				SkipToContent(node_15, { href: '#main-content' });
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_16 = $.sibling(node, 2);

	SideNav(node_16, {
		ariaLabel: 'Side navigation',
		get isOpen() {
			return isSideNavOpen;
		},

		set isOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			SideNavItems($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_2();
					var node_17 = $.first_child(fragment_7);

					SideNavLink(node_17, { href: '#', text: 'Side item A' });

					var node_18 = $.sibling(node_17, 2);

					SideNavLink(node_18, { href: '#', text: 'Side item B' });
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_16, 2);

	Content(node_19, {
		id: 'main-content',
		tabindex: '-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_4();

			$.next(2);
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}