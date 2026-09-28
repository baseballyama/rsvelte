import * as $ from 'svelte/internal/server';
import Drawer, { AppContent, Content, Header, Title, Subtitle } from '@smui/drawer';
import Button, { Label } from '@smui/button';
import List, { Item, Text } from '@smui/list';

export default function _Dismissible($$renderer) {
	let open = false;
	let active = 'Gray Kittens';

	function setActive(value) {
		active = value;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="drawer-container svelte-skdyr">`);

		Drawer($$renderer, {
			variant: 'dismissible',
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
								$$renderer.push(`<!---->Super Drawer`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Subtitle($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->It's the best drawer.`);
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
									onclick: () => setActive('Gray Kittens'),
									activated: active === 'Gray Kittens',
									children: ($$renderer) => {
										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Gray Kittens`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('A Space Rocket'),
									activated: active === 'A Space Rocket',
									children: ($$renderer) => {
										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->A Space Rocket`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('100 Pounds of Gravel'),
									activated: active === '100 Pounds of Gravel',
									children: ($$renderer) => {
										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->100 Pounds of Gravel`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('All of the Shrimp'),
									activated: active === 'All of the Shrimp',
									children: ($$renderer) => {
										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->All of the Shrimp`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Item($$renderer, {
									href: 'javascript:void(0)',
									onclick: () => setActive('A Planet with a Mall'),
									activated: active === 'A Planet with a Mall',
									children: ($$renderer) => {
										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->A Planet with a Mall`);
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
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		AppContent($$renderer, {
			class: 'app-content',
			children: ($$renderer) => {
				$$renderer.push(`<main class="main-content svelte-skdyr">`);

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

				$$renderer.push(`<!----> <br class="svelte-skdyr"/> <pre class="status svelte-skdyr">Active: ${$.escape(active)}</pre></main>`);
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