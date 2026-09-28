import * as $ from 'svelte/internal/server';
import { TagsInput } from '../../src/index.js';

export default function Tags_input($$renderer) {
	TagsInput($$renderer, {
		'data-testid': 'root',
		children: ($$renderer) => {
			if (TagsInput.Label) {
				$$renderer.push('<!--[-->');
				TagsInput.Label($$renderer, { 'data-testid': 'label' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (TagsInput.Control) {
				$$renderer.push('<!--[-->');

				TagsInput.Control($$renderer, {
					'data-testid': 'control',
					children: ($$renderer) => {
						if (TagsInput.Item) {
							$$renderer.push('<!--[-->');

							TagsInput.Item($$renderer, {
								index: 1,
								value: 'test',
								'data-testid': 'item',
								children: ($$renderer) => {
									if (TagsInput.ItemPreview) {
										$$renderer.push('<!--[-->');

										TagsInput.ItemPreview($$renderer, {
											'data-testid': 'item-preview',
											children: ($$renderer) => {
												if (TagsInput.ItemText) {
													$$renderer.push('<!--[-->');
													TagsInput.ItemText($$renderer, { 'data-testid': 'item-text' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (TagsInput.ItemDeleteTrigger) {
													$$renderer.push('<!--[-->');
													TagsInput.ItemDeleteTrigger($$renderer, { 'data-testid': 'item-delete-trigger' });
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

									$$renderer.push(` `);

									if (TagsInput.ItemInput) {
										$$renderer.push('<!--[-->');
										TagsInput.ItemInput($$renderer, { 'data-testid': 'item-input' });
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

			$$renderer.push(` `);

			if (TagsInput.Input) {
				$$renderer.push('<!--[-->');
				TagsInput.Input($$renderer, { 'data-testid': 'input' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (TagsInput.ClearTrigger) {
				$$renderer.push('<!--[-->');
				TagsInput.ClearTrigger($$renderer, { 'data-testid': 'clear-trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (TagsInput.HiddenInput) {
				$$renderer.push('<!--[-->');
				TagsInput.HiddenInput($$renderer, { 'data-testid': 'hidden-input' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}