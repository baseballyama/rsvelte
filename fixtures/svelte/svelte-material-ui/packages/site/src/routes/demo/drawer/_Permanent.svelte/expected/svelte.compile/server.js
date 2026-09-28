import * as $ from 'svelte/internal/server';
import Drawer, { AppContent, Content } from '@smui/drawer';
import List, { Item, Text } from '@smui/list';

export default function _Permanent($$renderer) {
	let clicked = 'nothing yet';

	$$renderer.push(`<div class="drawer-container svelte-cpv5i1">`);

	Drawer($$renderer, {
		children: ($$renderer) => {
			Content($$renderer, {
				children: ($$renderer) => {
					List($$renderer, {
						children: ($$renderer) => {
							Item($$renderer, {
								href: 'javascript:void(0)',
								onclick: () => clicked = 'Gray Kittens',
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
								onclick: () => clicked = 'A Space Rocket',
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
								onclick: () => clicked = '100 Pounds of Gravel',
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
								onclick: () => clicked = 'All of the Shrimp',
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
								onclick: () => clicked = 'A Planet with a Mall',
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	AppContent($$renderer, {
		class: 'app-content',
		children: ($$renderer) => {
			$$renderer.push(`<main class="main-content svelte-cpv5i1">App content. <br class="svelte-cpv5i1"/> <pre class="status svelte-cpv5i1">Clicked: ${$.escape(clicked)}</pre></main>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}