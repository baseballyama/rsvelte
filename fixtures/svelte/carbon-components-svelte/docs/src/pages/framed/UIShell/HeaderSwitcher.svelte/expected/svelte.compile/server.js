import * as $ from 'svelte/internal/server';

import {
	Column,
	Content,
	Grid,
	Header,
	HeaderAction,
	HeaderPanelDivider,
	HeaderPanelLink,
	HeaderPanelLinks,
	HeaderUtilities,
	RadioTile,
	Row,
	SideNav,
	SideNavItems,
	SideNavLink,
	SideNavMenu,
	SideNavMenuItem,
	SkipToContent,
	TileGroup
} from "carbon-components-svelte";

import { expoIn } from "svelte/easing";

export default function HeaderSwitcher($$renderer) {
	let isSideNavOpen = false;
	let isOpen = false;
	let selected = "0";

	let transitions = {
		0: { text: "None (default)", value: false },
		1: { text: "Slide (duration: 200ms)", value: { duration: 200 } },
		2: {
			text: "Custom (duration: 600ms, delay: 50ms, easing: expoIn)",
			value: { duration: 600, delay: 50, easing: expoIn }
		}
	};

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
						HeaderAction($$renderer, {
							transition: transitions[selected].value,
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

										HeaderPanelLink($$renderer, {
											href: '/watson-studio',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Watson Studio`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											href: '/maximo',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Maximo Application Suite`);
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
										$$renderer.push(`<h1>App switcher</h1> <p>Select a transition option below and click on the App Switcher icon in
          the top right.</p> `);

										TileGroup($$renderer, {
											legendText: 'App switcher transitions',
											get selected() {
												return selected;
											},

											set selected($$value) {
												selected = $$value;
												$$settled = false;
											},

											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(Object.keys(transitions));

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let key = each_array[$$index];

													RadioTile($$renderer, {
														value: key,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(transitions[key].text)}`);
														},
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!--]-->`);
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