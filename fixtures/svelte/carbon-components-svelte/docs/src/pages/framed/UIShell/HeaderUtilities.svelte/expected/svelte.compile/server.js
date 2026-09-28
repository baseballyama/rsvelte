import * as $ from 'svelte/internal/server';

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

export default function HeaderUtilities_1($$renderer) {
	let isSideNavOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Header($$renderer, {
			companyName: 'IBM',
			platformName: 'Cloud',
			get isSideNavOpen() {
				return isSideNavOpen;
			},

			set isSideNavOpen($$value) {
				isSideNavOpen = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				HeaderUtilities($$renderer, {
					children: ($$renderer) => {
						HeaderGlobalAction($$renderer, {
							iconDescription: 'Notifications',
							tooltipAlignment: 'start',
							icon: Notification,
							$$slots: {
								badge: ($$renderer) => {
									BadgeIndicator($$renderer, { slot: 'badge', count: 4 });
								}
							}
						});

						$$renderer.push(`<!----> `);

						HeaderGlobalAction($$renderer, {
							iconDescription: 'Help',
							icon: Help,
							$$slots: {
								badge: ($$renderer) => {
									BadgeIndicator($$renderer, { slot: 'badge', count: 0 });
								}
							}
						});

						$$renderer.push(`<!----> `);

						HeaderGlobalAction($$renderer, {
							iconDescription: 'Profile',
							tooltipAlignment: 'end',
							icon: UserAvatarFilledAlt
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},

			$$slots: {
				default: true,
				skipToContent: ($$renderer) => {
					{
						SkipToContent($$renderer, {});
					}
				}
			}
		});

		$$renderer.push(`<!----> `);

		SideNav($$renderer, {
			get isOpen() {
				return isSideNavOpen;
			},

			set isOpen($$value) {
				isSideNavOpen = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				SideNavItems($$renderer, {
					children: ($$renderer) => {
						SideNavLink($$renderer, { href: '/dashboard', text: 'Dashboard' });
						$$renderer.push(`<!----> `);
						SideNavLink($$renderer, { href: '/resources', text: 'Resource list' });
						$$renderer.push(`<!----> `);
						SideNavLink($$renderer, { href: '/activity', text: 'Activity tracker' });
						$$renderer.push(`<!----> `);

						SideNavMenu($$renderer, {
							text: 'Kubernetes',
							children: ($$renderer) => {
								SideNavMenuItem($$renderer, { href: '/kubernetes/clusters', text: 'Clusters' });
								$$renderer.push(`<!----> `);
								SideNavMenuItem($$renderer, { href: '/kubernetes/worker-pools', text: 'Worker pools' });
								$$renderer.push(`<!----> `);
								SideNavMenuItem($$renderer, { href: '/kubernetes/registry', text: 'Container registry' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Content($$renderer, {
			children: ($$renderer) => {
				Grid($$renderer, {
					children: ($$renderer) => {
						Row($$renderer, {
							children: ($$renderer) => {
								Column($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<h1>Dashboard</h1>`);
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

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}