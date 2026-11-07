import * as $ from 'svelte/internal/server';
import Menu, { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
import List, { Item, Separator, Text } from '@smui/list';
import Button, { Label } from '@smui/button';

export default function _SelectionGroup($$renderer) {
	let menu;
	let clicked = 'nothing yet';
	let selected1 = 'Red';
	let selected2 = 'Small';

	$$renderer.push(`<div style="min-width: 100px;">`);

	Button($$renderer, {
		onclick: () => menu.setOpen(true),
		children: ($$renderer) => {
			Label($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open Menu`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Menu($$renderer, {
		children: ($$renderer) => {
			List($$renderer, {
				children: ($$renderer) => {
					SelectionGroup($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(['Red', 'Green', 'Blue']);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let item = each_array[$$index];

								Item($$renderer, {
									onSMUIAction: () => selected1 = item,
									selected: selected1 === item,
									children: ($$renderer) => {
										SelectionGroupIcon($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<i class="material-icons">check</i>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);

					SelectionGroup($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(['Small', 'Medium', 'Large']);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let item = each_array_1[$$index_1];

								Item($$renderer, {
									onSMUIAction: () => selected2 = item,
									selected: selected2 === item,
									children: ($$renderer) => {
										SelectionGroupIcon($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<i class="material-icons">check</i>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(item)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);

					Item($$renderer, {
						onSMUIAction: () => clicked = 'Save for Later',
						children: ($$renderer) => {
							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Save for Later`);
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

	$$renderer.push(`<!----></div> <pre class="status">Selection 1: ${$.escape(selected1)}</pre> <pre class="status">Selection 2: ${$.escape(selected2)}</pre> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
}