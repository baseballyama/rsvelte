import * as $ from 'svelte/internal/server';
import { FileUpload } from '../../src/index.js';

export default function File_upload($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		FileUpload($$renderer, {
			'data-testid': 'root',
			children: ($$renderer) => {
				if (FileUpload.Label) {
					$$renderer.push('<!--[-->');
					FileUpload.Label($$renderer, { 'data-testid': 'label' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (FileUpload.Dropzone) {
					$$renderer.push('<!--[-->');

					FileUpload.Dropzone($$renderer, {
						'data-testid': 'dropzone',
						children: ($$renderer) => {
							if (FileUpload.Trigger) {
								$$renderer.push('<!--[-->');
								FileUpload.Trigger($$renderer, { 'data-testid': 'trigger' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (FileUpload.HiddenInput) {
								$$renderer.push('<!--[-->');
								FileUpload.HiddenInput($$renderer, { 'data-testid': 'hidden-input' });
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

				if (FileUpload.ClearTrigger) {
					$$renderer.push('<!--[-->');
					FileUpload.ClearTrigger($$renderer, { 'data-testid': 'clear-trigger' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (FileUpload.ItemGroup) {
					$$renderer.push('<!--[-->');

					FileUpload.ItemGroup($$renderer, {
						'data-testid': 'item-group',
						children: ($$renderer) => {
							if (FileUpload.Item) {
								$$renderer.push('<!--[-->');

								FileUpload.Item($$renderer, {
									file: new File(['test'], 'test.txt', { type: 'text/plain' }),
									'data-testid': 'item',
									children: ($$renderer) => {
										if (FileUpload.ItemName) {
											$$renderer.push('<!--[-->');
											FileUpload.ItemName($$renderer, { 'data-testid': 'item-name' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (FileUpload.ItemSizeText) {
											$$renderer.push('<!--[-->');
											FileUpload.ItemSizeText($$renderer, { 'data-testid': 'item-size-text' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (FileUpload.ItemDeleteTrigger) {
											$$renderer.push('<!--[-->');
											FileUpload.ItemDeleteTrigger($$renderer, { 'data-testid': 'item-delete-trigger' });
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