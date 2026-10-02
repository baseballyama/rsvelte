import * as $ from 'svelte/internal/server';
import { Listbox, useListCollection } from '../../src/index.js';

export default function Listbox_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const collection = $.derived(() => useListCollection({ items: [{ value: 'item', label: 'Item' }] }));

		Listbox($$renderer, {
			collection: collection(),
			'data-testid': 'root',
			children: ($$renderer) => {
				if (Listbox.Label) {
					$$renderer.push('<!--[-->');
					Listbox.Label($$renderer, { 'data-testid': 'label' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Listbox.Input) {
					$$renderer.push('<!--[-->');
					Listbox.Input($$renderer, { 'data-testid': 'input' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Listbox.Content) {
					$$renderer.push('<!--[-->');

					Listbox.Content($$renderer, {
						'data-testid': 'content',
						children: ($$renderer) => {
							if (Listbox.ItemGroup) {
								$$renderer.push('<!--[-->');

								Listbox.ItemGroup($$renderer, {
									'data-testid': 'item-group',
									children: ($$renderer) => {
										if (Listbox.ItemGroupLabel) {
											$$renderer.push('<!--[-->');
											Listbox.ItemGroupLabel($$renderer, { 'data-testid': 'item-group-label' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Listbox.Item) {
											$$renderer.push('<!--[-->');

											Listbox.Item($$renderer, {
												item: 'item',
												'data-testid': 'item',
												children: ($$renderer) => {
													if (Listbox.ItemText) {
														$$renderer.push('<!--[-->');

														Listbox.ItemText($$renderer, {
															'data-testid': 'item-text',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Item`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Listbox.ItemIndicator) {
														$$renderer.push('<!--[-->');
														Listbox.ItemIndicator($$renderer, { 'data-testid': 'item-indicator' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	});
}