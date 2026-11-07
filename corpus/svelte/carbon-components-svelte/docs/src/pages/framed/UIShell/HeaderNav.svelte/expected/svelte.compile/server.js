import * as $ from 'svelte/internal/server';

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

export default function HeaderNav_1($$renderer) {
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
				HeaderNav($$renderer, {
					children: ($$renderer) => {
						HeaderNavItem($$renderer, { href: '/catalog', text: 'Catalog' });
						$$renderer.push(`<!----> `);
						HeaderNavItem($$renderer, { href: '/docs', text: 'Docs' });
						$$renderer.push(`<!----> `);
						HeaderNavItem($$renderer, { href: '/support', text: 'Support' });
						$$renderer.push(`<!----> `);

						HeaderNavMenu($$renderer, {
							text: 'Manage',
							children: ($$renderer) => {
								HeaderNavItem($$renderer, { href: '/account', text: 'Account' });
								$$renderer.push(`<!----> `);
								HeaderNavItem($$renderer, { href: '/iam', text: 'Access (IAM)' });
								$$renderer.push(`<!----> `);
								HeaderNavItem($$renderer, { href: '/billing', text: 'Billing and usage' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						HeaderNavItem($$renderer, { href: '/status', text: 'Status' });
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
						SideNavLink($$renderer, { href: '/dashboard', text: 'Dashboard', isSelected: true });
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

						$$renderer.push(`<!----> `);
						SideNavDivider($$renderer, {});
						$$renderer.push(`<!----> `);
						SideNavLink($$renderer, { href: '/settings', text: 'Account settings' });
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