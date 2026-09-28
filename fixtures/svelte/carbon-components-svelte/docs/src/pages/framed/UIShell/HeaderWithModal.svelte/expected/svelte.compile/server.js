import * as $ from 'svelte/internal/server';

import {
	Button,
	Column,
	Content,
	Grid,
	Header,
	HeaderNav,
	HeaderNavItem,
	Modal,
	Row,
	SideNav,
	SideNavItems,
	SideNavLink,
	SideNavMenu,
	SideNavMenuItem,
	SkipToContent,
	Stack
} from "carbon-components-svelte";

export default function HeaderWithModal($$renderer) {
	let isSideNavOpen = false;
	let open = false;
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

						SideNavMenu($$renderer, {
							text: 'Kubernetes',
							children: ($$renderer) => {
								SideNavMenuItem($$renderer, { href: '/kubernetes/clusters', text: 'Clusters' });
								$$renderer.push(`<!----> `);
								SideNavMenuItem($$renderer, { href: '/kubernetes/worker-pools', text: 'Worker pools' });
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

		Modal($$renderer, {
			modalHeading: 'Create cluster',
			primaryButtonText: 'Create',
			secondaryButtonText: 'Cancel',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<p>The body scroll lock is ref-counted, so opening this modal while the side
    nav overlay is also open keeps the page locked until both are closed.</p>`);
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
										Stack($$renderer, {
											gap: 6,
											children: ($$renderer) => {
												$$renderer.push(`<h1>Clusters</h1> `);

												Button($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Create cluster`);
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