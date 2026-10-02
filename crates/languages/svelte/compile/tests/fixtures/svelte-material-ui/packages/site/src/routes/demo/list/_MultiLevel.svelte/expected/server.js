import * as $ from 'svelte/internal/server';
import List, { Item, Text } from '@smui/list';

export default function _MultiLevel($$renderer) {
	let clicked = 'nothing yet';

	$$renderer.push(`<div class="svelte-1iez5rj">`);

	List($$renderer, {
		class: 'demo-list',
		children: ($$renderer) => {
			Item($$renderer, {
				onSMUIAction: () => clicked = 'Level 1 - 1',
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Level 1 - 1`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				onSMUIAction: () => clicked = 'Level 1 - 2',
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Level 1 - 2`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				onSMUIAction: () => clicked = 'Level 1 - 3',
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Level 1 - 3`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				wrapper: true,
				children: ($$renderer) => {
					List($$renderer, {
						class: 'sub-list',
						children: ($$renderer) => {
							Item($$renderer, {
								onSMUIAction: () => clicked = 'Level 2.1 - 1',
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Level 2.1 - 1`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Item($$renderer, {
								onSMUIAction: () => clicked = 'Level 2.1 - 2',
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Level 2.1 - 2`);
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

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				onSMUIAction: () => clicked = 'Level 1 - 4',
				children: ($$renderer) => {
					Text($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Level 1 - 4`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Item($$renderer, {
				wrapper: true,
				children: ($$renderer) => {
					List($$renderer, {
						class: 'sub-list',
						children: ($$renderer) => {
							Item($$renderer, {
								onSMUIAction: () => clicked = 'Level 2.2 - 1',
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Level 2.2 - 1`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Item($$renderer, {
								onSMUIAction: () => clicked = 'Level 2.2 - 2',
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Level 2.2 - 2`);
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

	$$renderer.push(`<!----></div> <pre class="status svelte-1iez5rj">Clicked: ${$.escape(clicked)}</pre>`);
}