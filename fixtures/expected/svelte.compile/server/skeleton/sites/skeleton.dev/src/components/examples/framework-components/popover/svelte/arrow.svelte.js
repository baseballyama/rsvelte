import * as $ from 'svelte/internal/server';
import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Arrow($$renderer) {
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
										class: 'card max-w-md p-4 bg-surface-100-900 shadow-xl',
										children: ($$renderer) => {
											if (Popover.Description) {
												$$renderer.push('<!--[-->');

												Popover.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->This example will have a small arrow.`);
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