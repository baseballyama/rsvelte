import * as $ from 'svelte/internal/server';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import HeartIcon from '@lucide/svelte/icons/heart';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Sponsor($$renderer) {
	Menu($$renderer, {
		positioning: { placement: 'bottom-end' },
		children: ($$renderer) => {
			if (Menu.Trigger) {
				$$renderer.push('<!--[-->');

				Menu.Trigger($$renderer, {
					class: 'hidden xl:flex btn p-2 hover:preset-tonal data-[state=open]:preset-tonal',
					title: 'Sponsor Us',
					'aria-label': 'Sponsor Us',
					children: ($$renderer) => {
						HeartIcon($$renderer, { class: 'fill-surface-950-50 size-5' });
						$$renderer.push(`<!----> `);
						ChevronDownIcon($$renderer, { class: 'size-4 opacity-50' });
						$$renderer.push(`<!---->`);
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
					if (Menu.Positioner) {
						$$renderer.push('<!--[-->');

						Menu.Positioner($$renderer, {
							children: ($$renderer) => {
								if (Menu.Content) {
									$$renderer.push('<!--[-->');

									Menu.Content($$renderer, {
										class: 'z-50',
										children: ($$renderer) => {
											if (Menu.ItemGroup) {
												$$renderer.push('<!--[-->');

												Menu.ItemGroup($$renderer, {
													children: ($$renderer) => {
														if (Menu.ItemGroupLabel) {
															$$renderer.push('<!--[-->');

															Menu.ItemGroupLabel($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Support Skeleton`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														{
															function element($$renderer, attributes) {
																$$renderer.push(`<a${$.attributes({
																	...attributes,
																	href: 'https://github.com/sponsors/skeletonlabs',
																	target: '_blank',
																	rel: 'noreferrer noopener'
																})}>`);

																if (Menu.ItemText) {
																	$$renderer.push('<!--[-->');

																	Menu.ItemText($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Via GitHub`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);
																ArrowUpRightIcon($$renderer, { class: 'size-4 opacity-60' });
																$$renderer.push(`<!----></a>`);
															}

															if (Menu.Item) {
																$$renderer.push('<!--[-->');
																Menu.Item($$renderer, { value: 'github', element, $$slots: { element: true } });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														$$renderer.push(` `);

														{
															function element($$renderer, attributes) {
																$$renderer.push(`<a${$.attributes({
																	...attributes,
																	href: 'https://ko-fi.com/skeletonlabs',
																	target: '_blank',
																	rel: 'noreferrer noopener'
																})}>`);

																if (Menu.ItemText) {
																	$$renderer.push('<!--[-->');

																	Menu.ItemText($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Via Ko-Fi`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);
																ArrowUpRightIcon($$renderer, { class: 'size-4 opacity-60' });
																$$renderer.push(`<!----></a>`);
															}

															if (Menu.Item) {
																$$renderer.push('<!--[-->');
																Menu.Item($$renderer, { value: 'kofi', element, $$slots: { element: true } });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
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