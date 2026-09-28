import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	BadgeIndicator,
	Column,
	Content,
	Grid,
	Header,
	HeaderGlobalAction,
	HeaderUtilities,
	Row,
	SideNav,
	SideNavItems,
	SideNavLink,
	SideNavMenu,
	SideNavMenuItem,
	SkipToContent
} from "carbon-components-svelte";

import Help from "carbon-icons-svelte/lib/Help.svelte";
import Notification from "carbon-icons-svelte/lib/Notification.svelte";
import UserAvatarFilledAlt from "carbon-icons-svelte/lib/UserAvatarFilledAlt.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1>Dashboard</h1>`);

export default function HeaderUtilities_1($$anchor) {
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
			HeaderUtilities($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					HeaderGlobalAction(node_1, {
						iconDescription: 'Notifications',
						tooltipAlignment: 'start',
						get icon() {
							return Notification;
						},

						$$slots: {
							badge: ($$anchor, $$slotProps) => {
								BadgeIndicator($$anchor, { slot: 'badge', count: 4 });
							}
						}
					});

					var node_2 = $.sibling(node_1, 2);

					HeaderGlobalAction(node_2, {
						iconDescription: 'Help',
						get icon() {
							return Help;
						},

						$$slots: {
							badge: ($$anchor, $$slotProps) => {
								BadgeIndicator($$anchor, { slot: 'badge', count: 0 });
							}
						}
					});

					var node_3 = $.sibling(node_2, 2);

					HeaderGlobalAction(node_3, {
						iconDescription: 'Profile',
						tooltipAlignment: 'end',
						get icon() {
							return UserAvatarFilledAlt;
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

	var node_4 = $.sibling(node, 2);

	SideNav(node_4, {
		get isOpen() {
			return isSideNavOpen;
		},

		set isOpen($$value) {
			isSideNavOpen = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			SideNavItems($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_1();
					var node_5 = $.first_child(fragment_7);

					SideNavLink(node_5, { href: '/dashboard', text: 'Dashboard' });

					var node_6 = $.sibling(node_5, 2);

					SideNavLink(node_6, { href: '/resources', text: 'Resource list' });

					var node_7 = $.sibling(node_6, 2);

					SideNavLink(node_7, { href: '/activity', text: 'Activity tracker' });

					var node_8 = $.sibling(node_7, 2);

					SideNavMenu(node_8, {
						text: 'Kubernetes',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_9 = $.first_child(fragment_8);

							SideNavMenuItem(node_9, { href: '/kubernetes/clusters', text: 'Clusters' });

							var node_10 = $.sibling(node_9, 2);

							SideNavMenuItem(node_10, { href: '/kubernetes/worker-pools', text: 'Worker pools' });

							var node_11 = $.sibling(node_10, 2);

							SideNavMenuItem(node_11, { href: '/kubernetes/registry', text: 'Container registry' });
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_4, 2);

	Content(node_12, {
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