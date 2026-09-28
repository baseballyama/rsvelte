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
	Row,
	SkipToContent
} from "carbon-components-svelte";

import Help from "carbon-icons-svelte/lib/Help.svelte";
import Notification from "carbon-icons-svelte/lib/Notification.svelte";

export default function HeaderMultipleSwitcher($$renderer) {
	let isOpen1 = false;
	let isOpen2 = false;
	let isOpen3 = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Header($$renderer, {
			companyName: 'IBM',
			platformName: 'Cloud',
			isSideNavOpen: true,
			children: ($$renderer) => {
				HeaderUtilities($$renderer, {
					children: ($$renderer) => {
						HeaderAction($$renderer, {
							iconDescription: 'Notifications',
							tooltipAlignment: 'start',
							icon: Notification,
							get isOpen() {
								return isOpen1;
							},

							set isOpen($$value) {
								isOpen1 = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								HeaderPanelLinks($$renderer, {
									children: ($$renderer) => {
										HeaderPanelDivider($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Today`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											href: '/activity',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cluster "mycluster-prod" was updated`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelDivider($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Earlier`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											href: '/billing',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Your monthly invoice is ready`);
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

						HeaderAction($$renderer, {
							iconDescription: 'Help',
							icon: Help,
							get isOpen() {
								return isOpen2;
							},

							set isOpen($$value) {
								isOpen2 = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								HeaderPanelLinks($$renderer, {
									children: ($$renderer) => {
										HeaderPanelDivider($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Support`);
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

										HeaderPanelDivider($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Community`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										HeaderPanelLink($$renderer, {
											href: '/support',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Open a case`);
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

						HeaderAction($$renderer, {
							text: 'IBM Cloud',
							get isOpen() {
								return isOpen3;
							},

							set isOpen($$value) {
								isOpen3 = $$value;
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
											href: '/watson-studio',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Watson Studio`);
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