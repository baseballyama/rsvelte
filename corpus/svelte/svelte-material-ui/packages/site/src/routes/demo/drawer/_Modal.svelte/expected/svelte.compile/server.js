import * as $ from 'svelte/internal/server';
import Drawer, { AppContent, Content, Header, Title, Subtitle, Scrim } from '@smui/drawer';
import Button, { Label } from '@smui/button';
import List, { Item, Text, Graphic, Separator, Subheader } from '@smui/list';

export default function _Modal($$renderer) {
	let open = false;
	let active = 'Inbox';

	function setActive(value) {
		active = value;
		open = false;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="drawer-container svelte-12ouzm0">`);

		Drawer($$renderer, {
			variant: 'modal',
			fixed: false,
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Header($$renderer, {
					children: ($$renderer) => {
						Title($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Super Mail`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Subtitle($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->It's the best fake mail app drawer.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						List($$renderer, {
							children: ($$renderer) => {
								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Inbox'),
									activated: active === 'Inbox',
									children: ($$renderer) => {
										Graphic($$renderer, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$renderer) => {
												$$renderer.push(`<!---->inbox`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Inbox`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Star'),
									activated: active === 'Star',
									children: ($$renderer) => {
										Graphic($$renderer, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$renderer) => {
												$$renderer.push(`<!---->star`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Star`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Sent Mail'),
									activated: active === 'Sent Mail',
									children: ($$renderer) => {
										Graphic($$renderer, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$renderer) => {
												$$renderer.push(`<!---->send`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Sent Mail`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Drafts'),
									activated: active === 'Drafts',
									children: ($$renderer) => {
										Graphic($$renderer, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$renderer) => {
												$$renderer.push(`<!---->drafts`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Drafts`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);
								Separator($$renderer, {});
								$$renderer.push(`<!----> `);

								Subheader($$renderer, {
									tag: 'h6',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Labels`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Family'),
									activated: active === 'Family',
									children: ($$renderer) => {
										Graphic($$renderer, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$renderer) => {
												$$renderer.push(`<!---->bookmark`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Family`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Friends'),
									activated: active === 'Friends',
									children: ($$renderer) => {
										Graphic($$renderer, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$renderer) => {
												$$renderer.push(`<!---->bookmark`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Friends`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('Work'),
									activated: active === 'Work',
									children: ($$renderer) => {
										Graphic($$renderer, {
											class: 'material-icons',
											'aria-hidden': 'true',
											children: ($$renderer) => {
												$$renderer.push(`<!---->bookmark`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Work`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		Scrim($$renderer, { fixed: false });
		$$renderer.push(`<!----> `);

		AppContent($$renderer, {
			class: 'app-content',
			children: ($$renderer) => {
				$$renderer.push(`<main class="main-content svelte-12ouzm0">`);

				Button($$renderer, {
					onclick: () => open = !open,
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Toggle Drawer`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <br class="svelte-12ouzm0"/> <pre class="status svelte-12ouzm0">Active: ${$.escape(active)}</pre> <div style="height: 700px;" class="svelte-12ouzm0"> </div> And some stuff at the bottom.</main>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}