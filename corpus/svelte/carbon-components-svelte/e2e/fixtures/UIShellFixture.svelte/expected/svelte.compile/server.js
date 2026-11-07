import * as $ from 'svelte/internal/server';

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

export default function UIShellFixture($$renderer) {
	let isSideNavOpen = false;

	const searchResults = [
		{ href: "#", text: "Result one", description: "First" },
		{ href: "#", text: "Result two" }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Header($$renderer, {
			companyName: 'E2E',
			platformName: 'UIShell',
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
						HeaderSearch($$renderer, { results: searchResults });
						$$renderer.push(`<!----> `);

						ProfileMenu($$renderer, {
							iconDescription: 'Profile',
							children: ($$renderer) => {
								ProfileMenuHeader($$renderer, { name: 'Sadek Bazaraa', username: 'sbazaraa', href: '#' });
								$$renderer.push(`<!----> `);
								ProfileMenuDivider($$renderer, {});
								$$renderer.push(`<!----> `);

								ProfileMenuDetail($$renderer, {
									label: 'Plan',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Lite`);
									},

									$$slots: {
										default: true,
										action: ($$renderer) => {
											$$renderer.push(`<a slot="action" href="#">Upgrade</a>`);
										}
									}
								});

								$$renderer.push(`<!----> `);
								ProfileMenuDivider($$renderer, {});
								$$renderer.push(`<!----> `);

								ProfileMenuItem($$renderer, {
									href: '#',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Settings`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ProfileMenuItem($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Log out`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				HeaderNav($$renderer, {
					'aria-label': 'Top navigation',
					children: ($$renderer) => {
						HeaderNavItem($$renderer, { href: '#', text: 'Nav link' });
						$$renderer.push(`<!----> `);

						HeaderNavMenu($$renderer, {
							href: '#',
							text: 'Submenu',
							children: ($$renderer) => {
								HeaderNavItem($$renderer, { href: '#', text: 'Sub link one' });
								$$renderer.push(`<!----> `);
								HeaderNavItem($$renderer, { href: '#', text: 'Sub link two' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},

			$$slots: {
				default: true,
				skipToContent: ($$renderer) => {
					$$renderer.push(`<div slot="skipToContent">`);
					SkipToContent($$renderer, { href: '#main-content' });
					$$renderer.push(`<!----></div>`);
				}
			}
		});

		$$renderer.push(`<!----> `);

		SideNav($$renderer, {
			ariaLabel: 'Side navigation',
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
						SideNavLink($$renderer, { href: '#', text: 'Side item A' });
						$$renderer.push(`<!----> `);
						SideNavLink($$renderer, { href: '#', text: 'Side item B' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Content($$renderer, {
			id: 'main-content',
			tabindex: '-1',
			children: ($$renderer) => {
				$$renderer.push(`<p data-testid="main-paragraph">Primary page content</p> <button data-testid="outside-header-search" type="button">Dismiss region</button>`);
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