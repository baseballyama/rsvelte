import * as $ from 'svelte/internal/server';
import { themes } from '@/modules/themes';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import LaptopMinimalCheckIcon from '@lucide/svelte/icons/laptop-minimal-check';
import MoonIcon from '@lucide/svelte/icons/moon';
import PaletteIcon from '@lucide/svelte/icons/palette';
import SunIcon from '@lucide/svelte/icons/sun';
import { Popover, Portal, SegmentedControl } from '@skeletonlabs/skeleton-svelte';

export default function Theme($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let activeMode = void 0;
		let activeTheme = void 0;

		function setActiveMode(mode) {
			activeMode = mode;
			localStorage.setItem('mode', mode);
			document.documentElement.setAttribute('data-mode', mode);
		}

		async function setActiveTheme(theme) {
			activeTheme = theme;
			localStorage.setItem('theme', theme);
			document.documentElement.setAttribute('data-theme', theme);
		}

		Popover($$renderer, {
			children: ($$renderer) => {
				if (Popover.Trigger) {
					$$renderer.push('<!--[-->');

					Popover.Trigger($$renderer, {
						class: 'btn hover:preset-tonal data-[state=open]:preset-tonal px-2',
						children: ($$renderer) => {
							PaletteIcon($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----> <span class="hidden xl:inline">Theme</span> `);
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
						if (Popover.Positioner) {
							$$renderer.push('<!--[-->');

							Popover.Positioner($$renderer, {
								children: ($$renderer) => {
									if (Popover.Content) {
										$$renderer.push('<!--[-->');

										Popover.Content($$renderer, {
											class: 'card bg-surface-50-950 border border-surface-200-800 p-2 space-y-4 shadow-xl max-h-[75vh] lg:max-h-none overflow-y-auto z-50',
											children: ($$renderer) => {
												$$renderer.push(`<div>`);

												SegmentedControl($$renderer, {
													value: activeMode,
													onValueChange: (details) => details.value && setActiveMode(details.value),
													class: 'bg-surface-50-950 w-full mb-2',
													children: ($$renderer) => {
														if (SegmentedControl.Control) {
															$$renderer.push('<!--[-->');

															SegmentedControl.Control($$renderer, {
																children: ($$renderer) => {
																	if (SegmentedControl.Indicator) {
																		$$renderer.push('<!--[-->');
																		SegmentedControl.Indicator($$renderer, {});
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (SegmentedControl.Item) {
																		$$renderer.push('<!--[-->');

																		SegmentedControl.Item($$renderer, {
																			value: 'system',
																			children: ($$renderer) => {
																				if (SegmentedControl.ItemText) {
																					$$renderer.push('<!--[-->');

																					SegmentedControl.ItemText($$renderer, {
																						class: 'flex items-center gap-2',
																						children: ($$renderer) => {
																							LaptopMinimalCheckIcon($$renderer, { class: 'size-4' });
																							$$renderer.push(`<!----> <span>System</span>`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (SegmentedControl.ItemHiddenInput) {
																					$$renderer.push('<!--[-->');
																					SegmentedControl.ItemHiddenInput($$renderer, {});
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

																	if (SegmentedControl.Item) {
																		$$renderer.push('<!--[-->');

																		SegmentedControl.Item($$renderer, {
																			value: 'light',
																			children: ($$renderer) => {
																				if (SegmentedControl.ItemText) {
																					$$renderer.push('<!--[-->');

																					SegmentedControl.ItemText($$renderer, {
																						class: 'flex items-center gap-2',
																						children: ($$renderer) => {
																							SunIcon($$renderer, { class: 'size-4' });
																							$$renderer.push(`<!----> <span>Light</span>`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (SegmentedControl.ItemHiddenInput) {
																					$$renderer.push('<!--[-->');
																					SegmentedControl.ItemHiddenInput($$renderer, {});
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

																	if (SegmentedControl.Item) {
																		$$renderer.push('<!--[-->');

																		SegmentedControl.Item($$renderer, {
																			value: 'dark',
																			children: ($$renderer) => {
																				if (SegmentedControl.ItemText) {
																					$$renderer.push('<!--[-->');

																					SegmentedControl.ItemText($$renderer, {
																						class: 'flex items-center gap-2',
																						children: ($$renderer) => {
																							MoonIcon($$renderer, { class: 'size-4' });
																							$$renderer.push(`<!----> <span>Dark</span>`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (SegmentedControl.ItemHiddenInput) {
																					$$renderer.push('<!--[-->');
																					SegmentedControl.ItemHiddenInput($$renderer, {});
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

												$$renderer.push(`<!----></div> <div class="space-y-4"><div class="grid grid-cols-1 lg:grid-cols-3 gap-2"><!--[-->`);

												const each_array = $.ensure_array_like(themes);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let theme = each_array[$$index];

													$$renderer.push(`<button${$.attr('data-theme', theme.name)}${$.attr_class(`bg-surface-50-950 p-3 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 rounded-md grid grid-cols-[auto_1fr_auto] items-center gap-4 ${activeTheme === theme.name ? 'preset-outlined-surface-500' : ''}`)}><span>${$.escape(theme.emoji)}</span> <h3 class="text-sm capitalize font-bold text-left">${$.escape(theme.name)}</h3> <div class="flex justify-center items-center -space-x-1.5"><div class="aspect-square w-4 bg-primary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-4 bg-secondary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-4 bg-tertiary-500 border-[1px] border-black/10 rounded-full"></div></div></button>`);
												}

												$$renderer.push(`<!--]--></div></div> <div class="card bg-primary-500 flex justify-center items-center py-4 mx-auto"><a href="https://themes.skeleton.dev/" target="_blank" class="btn preset-filled"><span>Create a Theme</span> `);
												ArrowUpRightIcon($$renderer, { class: 'size-4' });
												$$renderer.push(`<!----></a></div>`);
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
	});
}