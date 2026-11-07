import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { themes } from '@/modules/themes';
import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import LaptopMinimalCheckIcon from '@lucide/svelte/icons/laptop-minimal-check';
import MoonIcon from '@lucide/svelte/icons/moon';
import PaletteIcon from '@lucide/svelte/icons/palette';
import SunIcon from '@lucide/svelte/icons/sun';
import { Popover, Portal, SegmentedControl } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <span class="hidden xl:inline">Theme</span> <!>`, 1);
var root_1 = $.from_html(`<!> <span>System</span>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <span>Light</span>`, 1);
var root_4 = $.from_html(`<!> <span>Dark</span>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<button><span> </span> <h3 class="text-sm capitalize font-bold text-left"> </h3> <div class="flex justify-center items-center -space-x-1.5"><div class="aspect-square w-4 bg-primary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-4 bg-secondary-500 border-[1px] border-black/10 rounded-full"></div> <div class="aspect-square w-4 bg-tertiary-500 border-[1px] border-black/10 rounded-full"></div></div></button>`);
var root_7 = $.from_html(`<div><!></div> <div class="space-y-4"><div class="grid grid-cols-1 lg:grid-cols-3 gap-2"></div></div> <div class="card bg-primary-500 flex justify-center items-center py-4 mx-auto"><a href="https://themes.skeleton.dev/" target="_blank" class="btn preset-filled"><span>Create a Theme</span> <!></a></div>`, 1);

export default function Theme($$anchor, $$props) {
	$.push($$props, true);

	let activeMode = $.state(void 0);
	let activeTheme = $.state(void 0);

	function setActiveMode(mode) {
		$.set(activeMode, mode, true);
		localStorage.setItem('mode', mode);
		document.documentElement.setAttribute('data-mode', mode);
	}

	async function setActiveTheme(theme) {
		$.set(activeTheme, theme, true);
		localStorage.setItem('theme', theme);
		document.documentElement.setAttribute('data-theme', theme);
	}

	$.user_effect(() => {
		$.set(activeMode, localStorage.getItem('mode') || 'system', true);
		$.set(activeTheme, localStorage.getItem('theme') || 'skeleton', true);
	});

	Popover($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
				Popover_Trigger($$anchor, {
					class: 'btn hover:preset-tonal data-[state=open]:preset-tonal px-2',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						PaletteIcon(node_1, { class: 'size-4' });

						var node_2 = $.sibling(node_1, 4);

						ChevronDownIcon(node_2, { class: 'size-4 opacity-50' });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			Portal(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => Popover.Positioner, ($$anchor, Popover_Positioner) => {
						Popover_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
									Popover_Content($$anchor, {
										class: 'card bg-surface-50-950 border border-surface-200-800 p-2 space-y-4 shadow-xl max-h-[75vh] lg:max-h-none overflow-y-auto z-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_7();
											var div = $.first_child(fragment_5);
											var node_6 = $.child(div);

											SegmentedControl(node_6, {
												get value() {
													return $.get(activeMode);
												},
												onValueChange: (details) => details.value && setActiveMode(details.value),
												class: 'bg-surface-50-950 w-full mb-2',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_7 = $.first_child(fragment_6);

													$.component(node_7, () => SegmentedControl.Control, ($$anchor, SegmentedControl_Control) => {
														SegmentedControl_Control($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = root_5();
																var node_8 = $.first_child(fragment_7);

																$.component(node_8, () => SegmentedControl.Indicator, ($$anchor, SegmentedControl_Indicator) => {
																	SegmentedControl_Indicator($$anchor, {});
																});

																var node_9 = $.sibling(node_8, 2);

																$.component(node_9, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item) => {
																	SegmentedControl_Item($$anchor, {
																		value: 'system',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_8 = root_2();
																			var node_10 = $.first_child(fragment_8);

																			$.component(node_10, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText) => {
																				SegmentedControl_ItemText($$anchor, {
																					class: 'flex items-center gap-2',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = root_1();
																						var node_11 = $.first_child(fragment_9);

																						LaptopMinimalCheckIcon(node_11, { class: 'size-4' });
																						$.next(2);
																						$.append($$anchor, fragment_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_12 = $.sibling(node_10, 2);

																			$.component(node_12, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput) => {
																				SegmentedControl_ItemHiddenInput($$anchor, {});
																			});

																			$.append($$anchor, fragment_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_13 = $.sibling(node_9, 2);

																$.component(node_13, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_1) => {
																	SegmentedControl_Item_1($$anchor, {
																		value: 'light',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root_2();
																			var node_14 = $.first_child(fragment_10);

																			$.component(node_14, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_1) => {
																				SegmentedControl_ItemText_1($$anchor, {
																					class: 'flex items-center gap-2',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_11 = root_3();
																						var node_15 = $.first_child(fragment_11);

																						SunIcon(node_15, { class: 'size-4' });
																						$.next(2);
																						$.append($$anchor, fragment_11);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_16 = $.sibling(node_14, 2);

																			$.component(node_16, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_1) => {
																				SegmentedControl_ItemHiddenInput_1($$anchor, {});
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_17 = $.sibling(node_13, 2);

																$.component(node_17, () => SegmentedControl.Item, ($$anchor, SegmentedControl_Item_2) => {
																	SegmentedControl_Item_2($$anchor, {
																		value: 'dark',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_12 = root_2();
																			var node_18 = $.first_child(fragment_12);

																			$.component(node_18, () => SegmentedControl.ItemText, ($$anchor, SegmentedControl_ItemText_2) => {
																				SegmentedControl_ItemText_2($$anchor, {
																					class: 'flex items-center gap-2',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_13 = root_4();
																						var node_19 = $.first_child(fragment_13);

																						MoonIcon(node_19, { class: 'size-4' });
																						$.next(2);
																						$.append($$anchor, fragment_13);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_20 = $.sibling(node_18, 2);

																			$.component(node_20, () => SegmentedControl.ItemHiddenInput, ($$anchor, SegmentedControl_ItemHiddenInput_2) => {
																				SegmentedControl_ItemHiddenInput_2($$anchor, {});
																			});

																			$.append($$anchor, fragment_12);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});

											$.reset(div);

											var div_1 = $.sibling(div, 2);
											var div_2 = $.child(div_1);

											$.each(div_2, 20, () => themes, (theme) => theme, ($$anchor, theme) => {
												var button = root_6();
												var span = $.child(button);
												var text = $.only_child(span, true);
												var h3 = $.sibling(span, 2);
												var text_1 = $.only_child(h3, true);

												$.next(2);
												$.reset(button);

												$.template_effect(() => {
													$.set_attribute(button, 'data-theme', theme.name);
													$.set_class(button, 1, `bg-surface-50-950 p-3 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 rounded-md grid grid-cols-[auto_1fr_auto] items-center gap-4 ${$.get(activeTheme) === theme.name ? 'preset-outlined-surface-500' : ''}`);
													$.set_text(text, theme.emoji);
													$.set_text(text_1, theme.name);
												});

												$.delegated('click', button, () => setActiveTheme(theme.name));
												$.append($$anchor, button);
											});

											$.reset(div_2);
											$.reset(div_1);

											var div_3 = $.sibling(div_1, 2);
											var a = $.child(div_3);
											var node_21 = $.sibling($.child(a), 2);

											ArrowUpRightIcon(node_21, { class: 'size-4' });
											$.reset(a);
											$.reset(div_3);
											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}

$.delegate(['click']);