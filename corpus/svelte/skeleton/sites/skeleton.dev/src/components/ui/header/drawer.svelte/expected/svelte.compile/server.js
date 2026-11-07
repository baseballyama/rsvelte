import * as $ from 'svelte/internal/server';
import MenuIcon from '@lucide/svelte/icons/menu';
import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Drawer($$renderer, $$props) {
	const { children } = $$props;

	Dialog($$renderer, {
		children: ($$renderer) => {
			if (Dialog.Trigger) {
				$$renderer.push('<!--[-->');

				Dialog.Trigger($$renderer, {
					class: 'btn-icon hover:preset-tonal',
					children: ($$renderer) => {
						MenuIcon($$renderer, { class: 'size-4' });
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
							class: 'fixed inset-0 z-50 bg-surface-50-950/50 transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100'
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
										class: 'card border-r border-surface-200-800 bg-surface-50-950/75 backdrop-blur-lg w-sm h-dvh p-4 space-y-4 shadow-xl overflow-y-auto hide-scrollbar-track transition transition-discrete opacity-0 -translate-x-full starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0 motion-reduce:transition-none',
										children: ($$renderer) => {
											$$renderer.push(`<header class="flex justify-between items-center gap-4">`);

											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'text-2xl font-bold',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Skeleton`);
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
													class: 'btn-icon hover:preset-tonal rounded-full',
													children: ($$renderer) => {
														$$renderer.push(`<!---->×`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</header> <hr class="hr"/> <div class="overflow-y-auto">`);
											children($$renderer);
											$$renderer.push(`<!----></div>`);
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