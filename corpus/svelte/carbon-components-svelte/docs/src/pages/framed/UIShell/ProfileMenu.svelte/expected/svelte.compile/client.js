import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Content,
	Header,
	HeaderUtilities,
	ProfileMenu,
	ProfileMenuDetail,
	ProfileMenuDivider,
	ProfileMenuHeader,
	ProfileMenuItem,
	ProfileMenuList,
	SkipToContent,
	UserAvatar
} from "carbon-components-svelte";

import Logout from "carbon-icons-svelte/lib/Logout.svelte";

var root = $.from_html(`<a slot="action" href="/">Upgrade</a>`);
var root_1 = $.from_html(`<a slot="action" href="/">Change</a>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<h1>Welcome</h1>`);
var root_5 = $.from_html(`<!> <!>`, 1);

export default function ProfileMenu_1($$anchor) {
	const image = "https://i.pravatar.cc/300?img=12";
	var fragment = root_5();
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
							var fragment_3 = root_3();
							var node_1 = $.first_child(fragment_3);

							ProfileMenuHeader(node_1, {
								name: 'Richard Hendricks',
								username: 'rhendricks',
								href: '/',
								$$slots: {
									avatar: ($$anchor, $$slotProps) => {
										UserAvatar($$anchor, {
											slot: 'avatar',
											size: 'lg',
											image,
											imageDescription: 'Richard Hendricks'
										});
									}
								}
							});

							var node_2 = $.sibling(node_1, 2);

							ProfileMenuDivider(node_2, {});

							var node_3 = $.sibling(node_2, 2);

							ProfileMenuDetail(node_3, {
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

							var node_4 = $.sibling(node_3, 2);

							ProfileMenuDivider(node_4, {});

							var node_5 = $.sibling(node_4, 2);

							ProfileMenuDetail(node_5, {
								label: 'Location',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Dallas, TX');

									$.append($$anchor, text_1);
								},

								$$slots: {
									default: true,
									action: ($$anchor, $$slotProps) => {
										var a_1 = root_1();

										$.append($$anchor, a_1);
									}
								}
							});

							var node_6 = $.sibling(node_5, 2);

							ProfileMenuDivider(node_6, {});

							var node_7 = $.sibling(node_6, 2);

							ProfileMenuList(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var node_8 = $.first_child(fragment_5);

									ProfileMenuItem(node_8, {
										href: '/',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Settings');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									ProfileMenuItem(node_9, {
										href: '/',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Privacy');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									ProfileMenuItem(node_10, {
										href: '/',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Feedback');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_11 = $.sibling(node_10, 2);

									ProfileMenuItem(node_11, {
										href: '/',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('About');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_11, 2);

									ProfileMenuItem(node_12, {
										$$events: { click: () => {} },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Change theme');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_13 = $.sibling(node_7, 2);

							ProfileMenuDivider(node_13, {});

							var node_14 = $.sibling(node_13, 2);

							ProfileMenuList(node_14, {
								children: ($$anchor, $$slotProps) => {
									ProfileMenuItem($$anchor, {
										get icon() {
											return Logout;
										},
										$$events: { click: () => {} },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Log out');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},

						$$slots: {
							default: true,
							avatar: ($$anchor, $$slotProps) => {
								UserAvatar($$anchor, {
									slot: 'avatar',
									size: 'md',
									image,
									imageDescription: 'Richard Hendricks'
								});
							}
						}
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

	var node_15 = $.sibling(node, 2);

	Content(node_15, {
		children: ($$anchor, $$slotProps) => {
			var h1 = root_4();

			$.append($$anchor, h1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}