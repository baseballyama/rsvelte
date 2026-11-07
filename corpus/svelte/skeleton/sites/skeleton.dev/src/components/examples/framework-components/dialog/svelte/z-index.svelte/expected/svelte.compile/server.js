import * as $ from 'svelte/internal/server';
import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Z_index($$renderer) {
	Dialog($$renderer, {
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
						Dialog.Backdrop($$renderer, { class: 'fixed inset-0 z-50 bg-surface-50-950/50' });
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
										class: 'card bg-surface-100-900 w-md p-4 space-y-2 shadow-xl',
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'text-2xl font-bold',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Setting Z-Index`);
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
														$$renderer.push(`<!---->This dialog will have a z-index value of 50.`);
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
													class: 'btn preset-tonal',
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