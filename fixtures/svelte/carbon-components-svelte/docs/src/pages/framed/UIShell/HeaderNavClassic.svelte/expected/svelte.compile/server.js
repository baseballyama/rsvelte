import * as $ from 'svelte/internal/server';

import {
	Column,
	Content,
	Grid,
	Header,
	HeaderAction,
	HeaderNav,
	HeaderNavItem,
	HeaderNavMenu,
	HeaderPanelDivider,
	HeaderPanelLink,
	HeaderPanelLinks,
	HeaderUtilities,
	Row,
	SideNav,
	SideNavDivider,
	SideNavItems,
	SideNavLink,
	SideNavMenu,
	SideNavMenuItem,
	SkipToContent
} from "carbon-components-svelte";

export default function HeaderNavClassic($$renderer) {
	let isSideNavOpen = false;
	let isOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Header($$renderer, {
			companyName: 'IBM',
			platformName: 'Cloud',
			theme: 'classic',
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

				$$renderer.push(`<!----> `);

				HeaderUtilities($$renderer, {
					children: ($$renderer) => {
						HeaderAction($$renderer, {
							get isOpen() {
								return isOpen;
							},

							set isOpen($$value) {
								isOpen = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								HeaderPanelLinks($$renderer, {
									children: ($$renderer) => {
										HeaderPanelDivider($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Switch product`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											href: '/cloud',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cloud console`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelDivider($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Resources`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											href: '/docs',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Documentation`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											href: '/status',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Status page`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											href: '/community',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Community`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
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
			theme: 'classic',
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