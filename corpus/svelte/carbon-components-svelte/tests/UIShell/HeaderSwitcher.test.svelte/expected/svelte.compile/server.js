import * as $ from 'svelte/internal/server';
import Column from "carbon-components-svelte/Grid/Column.svelte";
import Grid from "carbon-components-svelte/Grid/Grid.svelte";
import Row from "carbon-components-svelte/Grid/Row.svelte";
import Content from "carbon-components-svelte/UIShell/Content.svelte";
import Header from "carbon-components-svelte/UIShell/Header.svelte";
import HeaderAction from "carbon-components-svelte/UIShell/HeaderAction.svelte";
import HeaderPanelDivider from "carbon-components-svelte/UIShell/HeaderPanelDivider.svelte";
import HeaderPanelLink from "carbon-components-svelte/UIShell/HeaderPanelLink.svelte";
import HeaderPanelLinks from "carbon-components-svelte/UIShell/HeaderPanelLinks.svelte";
import HeaderUtilities from "carbon-components-svelte/UIShell/HeaderUtilities.svelte";
import SideNav from "carbon-components-svelte/UIShell/SideNav.svelte";
import SideNavItems from "carbon-components-svelte/UIShell/SideNavItems.svelte";
import SideNavLink from "carbon-components-svelte/UIShell/SideNavLink.svelte";
import SideNavMenu from "carbon-components-svelte/UIShell/SideNavMenu.svelte";
import SideNavMenuItem from "carbon-components-svelte/UIShell/SideNavMenuItem.svelte";
import SkipToContent from "carbon-components-svelte/UIShell/SkipToContent.svelte";

export default function HeaderSwitcher_test($$renderer) {
	let isSideNavOpen = false;
	let isOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Header($$renderer, {
			companyName: 'IBM',
			platformName: 'Carbon Svelte',
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
						HeaderAction($$renderer, {
							transition: false,
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
												$$renderer.push(`<!---->Switcher subject 1`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Switcher item 1`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);
										HeaderPanelDivider($$renderer, {});
										$$renderer.push(`<!----> `);

										HeaderPanelDivider($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Switcher subject 2`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Switcher item 1`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Switcher item 2`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Switcher item 3`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Switcher item 4`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Switcher item 5`);
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
			},

			$$slots: {
				default: true,
				skipToContent: ($$renderer) => {
					$$renderer.push(`<div slot="skipToContent">`);
					SkipToContent($$renderer, {});
					$$renderer.push(`<!----></div>`);
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
						SideNavLink($$renderer, { text: 'Link 1' });
						$$renderer.push(`<!----> `);
						SideNavLink($$renderer, { text: 'Link 2' });
						$$renderer.push(`<!----> `);
						SideNavLink($$renderer, { text: 'Link 3' });
						$$renderer.push(`<!----> `);

						SideNavMenu($$renderer, {
							text: 'Menu',
							children: ($$renderer) => {
								SideNavMenuItem($$renderer, { href: '/', text: 'Link 1' });
								$$renderer.push(`<!----> `);
								SideNavMenuItem($$renderer, { href: '/', text: 'Link 2' });
								$$renderer.push(`<!----> `);
								SideNavMenuItem($$renderer, { href: '/', text: 'Link 3' });
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
										$$renderer.push(`<h1>Welcome</h1>`);
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