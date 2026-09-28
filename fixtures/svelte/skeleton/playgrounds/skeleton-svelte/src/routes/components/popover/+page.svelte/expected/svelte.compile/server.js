import * as $ from 'svelte/internal/server';
import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	Popover($$renderer, {
		children: ($$renderer) => {
			if (Popover.Trigger) {
				$$renderer.push('<!--[-->');

				Popover.Trigger($$renderer, {
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
					if (Popover.Positioner) {
						$$renderer.push('<!--[-->');

						Popover.Positioner($$renderer, {
							children: ($$renderer) => {
								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
										class: 'card max-w-md p-4 bg-surface-100-900 shadow-xl space-y-2',
										children: ($$renderer) => {
											if (Popover.Title) {
												$$renderer.push('<!--[-->');

												Popover.Title($$renderer, {
													class: 'font-bold',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Title`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Popover.Description) {
												$$renderer.push('<!--[-->');

												Popover.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sapiente magni distinctio explicabo quisquam. Rerum impedit culpa
					nesciunt enim.`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Popover.CloseTrigger) {
												$$renderer.push('<!--[-->');

												Popover.CloseTrigger($$renderer, {
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

											$$renderer.push(` `);

											if (Popover.Arrow) {
												$$renderer.push('<!--[-->');

												Popover.Arrow($$renderer, {
													class: '[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]',
													children: ($$renderer) => {
														if (Popover.ArrowTip) {
															$$renderer.push('<!--[-->');
															Popover.ArrowTip($$renderer, {});
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}