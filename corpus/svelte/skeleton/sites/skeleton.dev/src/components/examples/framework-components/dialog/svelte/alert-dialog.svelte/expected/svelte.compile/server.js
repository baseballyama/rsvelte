import * as $ from 'svelte/internal/server';
import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Alert_dialog($$renderer) {
	Dialog($$renderer, {
		role: 'alertdialog',
		children: ($$renderer) => {
			if (Dialog.Trigger) {
				$$renderer.push('<!--[-->');

				Dialog.Trigger($$renderer, {
					class: 'btn preset-filled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Trigger`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Portal($$renderer, {
				children: ($$renderer) => {
					if (Dialog.Backdrop) {
						$$renderer.push('<!--[-->');
						Dialog.Backdrop($$renderer, { class: 'fixed inset-0 z-50 bg-error-50-950/50' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Dialog.Positioner) {
						$$renderer.push('<!--[-->');

						Dialog.Positioner($$renderer, {
							class: 'fixed inset-0 z-50 flex justify-center items-center',
							children: ($$renderer) => {
								if (Dialog.Content) {
									$$renderer.push('<!--[-->');

									Dialog.Content($$renderer, {
										class: 'card preset-filled-error-500 w-md p-4 space-y-2 shadow-xl',
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'text-2xl font-bold',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Alert`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Dialog.Description) {
												$$renderer.push('<!--[-->');

												Dialog.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Something important has happened!`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Dialog.CloseTrigger) {
												$$renderer.push('<!--[-->');

												Dialog.CloseTrigger($$renderer, {
													class: 'btn preset-tonal-error',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Close`);
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}