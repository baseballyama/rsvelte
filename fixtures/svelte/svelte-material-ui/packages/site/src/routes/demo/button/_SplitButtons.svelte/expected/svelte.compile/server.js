import * as $ from 'svelte/internal/server';
import Button, { Group, GroupItem, Label, Icon } from '@smui/button';
import Menu from '@smui/menu';
import List, { Item, Separator, Text } from '@smui/list';

export default function _SplitButtons($$renderer) {
	let clicked = 0;
	let menu;
	let menu2;

	Group($$renderer, {
		variant: 'raised',
		children: ($$renderer) => {
			Button($$renderer, {
				onclick: () => clicked++,
				variant: 'raised',
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Do the thing`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div>`);

			Button($$renderer, {
				onclick: () => menu.setOpen(true),
				variant: 'raised',
				style: 'padding: 0; min-width: 36px;',
				children: ($$renderer) => {
					Icon($$renderer, {
						class: 'material-icons',
						style: 'margin: 0;',
						children: ($$renderer) => {
							$$renderer.push(`<!---->arrow_drop_down`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Menu($$renderer, {
				anchorCorner: 'TOP_LEFT',
				children: ($$renderer) => {
					List($$renderer, {
						children: ($$renderer) => {
							Item($$renderer, {
								onSMUIAction: () => clicked++,
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Thing 1`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Item($$renderer, {
								onSMUIAction: () => clicked++,
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Thing 2`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							Separator($$renderer, {});
							$$renderer.push(`<!----> `);

							Item($$renderer, {
								onSMUIAction: () => clicked++,
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Thing 3`);
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

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Group($$renderer, {
		variant: 'outlined',
		children: ($$renderer) => {
			Button($$renderer, {
				onclick: () => clicked++,
				variant: 'outlined',
				children: ($$renderer) => {
					Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Do the thing`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div>`);

			Button($$renderer, {
				onclick: () => menu2.setOpen(true),
				variant: 'outlined',
				style: 'padding: 0; min-width: 36px;',
				children: ($$renderer) => {
					Icon($$renderer, {
						class: 'material-icons',
						style: 'margin: 0;',
						children: ($$renderer) => {
							$$renderer.push(`<!---->arrow_drop_down`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Menu($$renderer, {
				anchorCorner: 'TOP_LEFT',
				children: ($$renderer) => {
					List($$renderer, {
						children: ($$renderer) => {
							Item($$renderer, {
								onSMUIAction: () => clicked++,
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Thing 1`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Item($$renderer, {
								onSMUIAction: () => clicked++,
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Thing 2`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);
							Separator($$renderer, {});
							$$renderer.push(`<!----> `);

							Item($$renderer, {
								onSMUIAction: () => clicked++,
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Thing 3`);
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

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}