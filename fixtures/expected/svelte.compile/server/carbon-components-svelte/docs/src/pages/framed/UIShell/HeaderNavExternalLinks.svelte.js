import * as $ from 'svelte/internal/server';

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

export default function HeaderNavExternalLinks($$renderer) {
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
						HeaderNavItem($$renderer, { href: '/resources', text: 'Resource list' });
						$$renderer.push(`<!----> `);

						HeaderNavItem($$renderer, {
							href: 'https://cloud.ibm.com/docs',
							target: '_blank',
							text: 'Docs',
							icon: Launch
						});

						$$renderer.push(`<!----> `);

						HeaderNavItem($$renderer, {
							href: 'https://cloud.ibm.com/status',
							target: '_blank',
							text: 'Status',
							icon: Launch
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
						HeaderSideNavItems($$renderer, {
							hasDivider: true,
							children: ($$renderer) => {
								HeaderNavItem($$renderer, { href: '/catalog', text: 'Catalog' });
								$$renderer.push(`<!----> `);
								HeaderNavItem($$renderer, { href: '/resources', text: 'Resource list' });
								$$renderer.push(`<!----> `);

								HeaderNavItem($$renderer, {
									href: 'https://cloud.ibm.com/docs',
									target: '_blank',
									text: 'Docs',
									icon: Launch
								});

								$$renderer.push(`<!----> `);

								HeaderNavItem($$renderer, {
									href: 'https://cloud.ibm.com/status',
									target: '_blank',
									text: 'Status',
									icon: Launch
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);
						SideNavLink($$renderer, { href: '/dashboard', text: 'Dashboard', isSelected: true });
						$$renderer.push(`<!----> `);
						SideNavLink($$renderer, { href: '/activity', text: 'Activity tracker' });
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