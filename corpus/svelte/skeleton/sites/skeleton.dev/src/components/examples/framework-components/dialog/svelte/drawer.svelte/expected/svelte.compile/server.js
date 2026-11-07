import * as $ from 'svelte/internal/server';
import XIcon from '@lucide/svelte/icons/x';
import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Drawer($$renderer) {
	// The following animations are optional.
	// These may also be included inline.
	const animBackdrop = 'transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100';

	const animModal = 'transition transition-discrete opacity-0 -translate-x-full starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0';

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

						Dialog.Backdrop($$renderer, {
							class: 'fixed inset-0 z-50 bg-surface-50-950/50 transition transition-discrete transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100'
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Dialog.Positioner) {
						$$renderer.push('<!--[-->');

						Dialog.Positioner($$renderer, {
							class: 'fixed inset-0 z-50 flex justify-start',
							children: ($$renderer) => {
								if (Dialog.Content) {
									$$renderer.push('<!--[-->');

									Dialog.Content($$renderer, {
										class: 'h-screen card bg-surface-100-900 w-sm p-4 space-y-4 shadow-xl transition transition-discrete opacity-0 -translate-x-full starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0',
										children: ($$renderer) => {
											$$renderer.push(`<header class="flex justify-between items-center">`);

											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'text-2xl font-bold',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Drawer`);
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
													class: 'btn-icon preset-tonal',
													children: ($$renderer) => {
														XIcon($$renderer, {});
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</header> <p>A slide out drawer panel.</p>`);
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