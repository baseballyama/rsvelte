import * as $ from 'svelte/internal/server';
import { Dialog } from '../../src/index.js';

export default function Dialog_1($$renderer) {
	Dialog($$renderer, {
		children: ($$renderer) => {
			if (Dialog.Trigger) {
				$$renderer.push('<!--[-->');
				Dialog.Trigger($$renderer, { 'data-testid': 'trigger' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Dialog.Backdrop) {
				$$renderer.push('<!--[-->');
				Dialog.Backdrop($$renderer, { 'data-testid': 'backdrop' });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Dialog.Positioner) {
				$$renderer.push('<!--[-->');

				Dialog.Positioner($$renderer, {
					'data-testid': 'positioner',
					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								'data-testid': 'content',
								children: ($$renderer) => {
									if (Dialog.Title) {
										$$renderer.push('<!--[-->');
										Dialog.Title($$renderer, { 'data-testid': 'title' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Dialog.Description) {
										$$renderer.push('<!--[-->');
										Dialog.Description($$renderer, { 'data-testid': 'description' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Dialog.CloseTrigger) {
										$$renderer.push('<!--[-->');
										Dialog.CloseTrigger($$renderer, { 'data-testid': 'close-trigger' });
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
}