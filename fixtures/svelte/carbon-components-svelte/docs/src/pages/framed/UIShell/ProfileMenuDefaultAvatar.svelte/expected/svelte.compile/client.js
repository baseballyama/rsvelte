import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Content,
	Header,
	HeaderUtilities,
	ProfileMenu,
	ProfileMenuDivider,
	ProfileMenuHeader,
	ProfileMenuItem,
	ProfileMenuList,
	SkipToContent
} from "carbon-components-svelte";

import Logout from "carbon-icons-svelte/lib/Logout.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1>Welcome</h1>`);

export default function ProfileMenuDefaultAvatar($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Header(node, {
		companyName: 'IBM',
		platformName: 'Carbon Svelte',
		children: ($$anchor, $$slotProps) => {
			HeaderUtilities($$anchor, {
				children: ($$anchor, $$slotProps) => {
					ProfileMenu($$anchor, {
						iconDescription: 'Profile',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_1 = $.first_child(fragment_3);

							ProfileMenuHeader(node_1, { name: 'Richard Hendricks', username: 'rhendricks', href: '/' });

							var node_2 = $.sibling(node_1, 2);

							ProfileMenuDivider(node_2, {});

							var node_3 = $.sibling(node_2, 2);

							ProfileMenuList(node_3, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_4 = $.first_child(fragment_4);

									ProfileMenuItem(node_4, {
										href: '/',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Settings');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_5 = $.sibling(node_4, 2);

									ProfileMenuItem(node_5, {
										href: '/',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Privacy');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_3, 2);

							ProfileMenuDivider(node_6, {});

							var node_7 = $.sibling(node_6, 2);

							ProfileMenuList(node_7, {
								children: ($$anchor, $$slotProps) => {
									ProfileMenuItem($$anchor, {
										get icon() {
											return Logout;
										},
										$$events: { click: () => {} },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Log out');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
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
			var h1 = root_2();

			$.append($$anchor, h1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}