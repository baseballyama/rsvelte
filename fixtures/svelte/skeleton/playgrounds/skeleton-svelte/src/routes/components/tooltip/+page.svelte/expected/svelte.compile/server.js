import * as $ from 'svelte/internal/server';
import { Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	Tooltip($$renderer, {
		children: ($$renderer) => {
			if (Tooltip.Trigger) {
				$$renderer.push('<!--[-->');

				Tooltip.Trigger($$renderer, {
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
					if (Tooltip.Positioner) {
						$$renderer.push('<!--[-->');

						Tooltip.Positioner($$renderer, {
							children: ($$renderer) => {
								if (Tooltip.Content) {
									$$renderer.push('<!--[-->');

									Tooltip.Content($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Content `);

											if (Tooltip.Arrow) {
												$$renderer.push('<!--[-->');

												Tooltip.Arrow($$renderer, {
													class: '[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]',
													children: ($$renderer) => {
														if (Tooltip.ArrowTip) {
															$$renderer.push('<!--[-->');
															Tooltip.ArrowTip($$renderer, {});
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