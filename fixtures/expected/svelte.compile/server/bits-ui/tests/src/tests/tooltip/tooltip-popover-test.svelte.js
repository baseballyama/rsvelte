import * as $ from 'svelte/internal/server';
import { Popover, Tooltip } from "bits-ui";

export default function Tooltip_popover_test($$renderer) {
	if (Tooltip.Provider) {
		$$renderer.push('<!--[-->');

		Tooltip.Provider($$renderer, {
			children: ($$renderer) => {
				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');

					Tooltip.Root($$renderer, {
						delayDuration: 0,
						children: ($$renderer) => {
							if (Popover.Root) {
								$$renderer.push('<!--[-->');

								Popover.Root($$renderer, {
									children: ($$renderer) => {
										{
											function child($$renderer, { props }) {
												if (Popover.Trigger) {
													$$renderer.push('<!--[-->');

													Popover.Trigger($$renderer, $.spread_props([
														props,
														{
															children: ($$renderer) => {
																$$renderer.push(`<!---->Resize`);
															},
															$$slots: { default: true }
														}
													]));

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (Tooltip.Trigger) {
												$$renderer.push('<!--[-->');
												Tooltip.Trigger($$renderer, { 'data-testid': 'trigger', child, $$slots: { child: true } });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										if (Popover.Portal) {
											$$renderer.push('<!--[-->');

											Popover.Portal($$renderer, {
												children: ($$renderer) => {
													if (Popover.Content) {
														$$renderer.push('<!--[-->');
														Popover.Content($$renderer, { 'data-testid': 'popover-content' });
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

							if (Tooltip.Portal) {
								$$renderer.push('<!--[-->');

								Tooltip.Portal($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Content) {
											$$renderer.push('<!--[-->');

											Tooltip.Content($$renderer, {
												'data-testid': 'tooltip-content',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Hello World!`);
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

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}