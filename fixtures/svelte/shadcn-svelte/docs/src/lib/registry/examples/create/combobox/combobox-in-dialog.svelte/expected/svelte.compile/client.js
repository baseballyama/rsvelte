import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from "svelte";
import { toast } from "svelte-sonner";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Combobox_in_dialog($$anchor, $$props) {
	$.push($$props, true);

	const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
	let dialogOpen = $.state(false);
	let comboboxOpen = $.state(false);
	let value = $.state("");
	let triggerRef = $.state(null);
	const selectedValue = $.derived(() => $.get(value) || null);

	function closeAndFocusTrigger() {
		$.set(comboboxOpen, false);

		tick().then(() => {
			$.get(triggerRef)?.focus();
		});
	}

	Example($$anchor, {
		title: 'Combobox in Dialog',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					get open() {
						return $.get(dialogOpen);
					},

					set open($$value) {
						$.set(dialogOpen, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Open Dialog');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								class: 'sm:max-w-[425px]',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_3();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Select Framework');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Choose your preferred framework from the list below.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_3, 2);

									$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
										Field_Field($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
													Field_Label($$anchor, {
														for: 'framework-dialog',
														class: 'sr-only',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Framework');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Popover.Root, ($$anchor, Popover_Root) => {
													Popover_Root($$anchor, {
														get open() {
															return $.get(comboboxOpen);
														},

														set open($$value) {
															$.set(comboboxOpen, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_9 = $.first_child(fragment_7);

															{
																const child = ($$anchor, $$arg0) => {
																	let props = () => ($$arg0?.()).props;

																	Button($$anchor, $.spread_props(props, {
																		variant: 'outline',
																		class: 'w-full justify-between font-normal',
																		role: 'combobox',
																		get 'aria-expanded'() {
																			return $.get(comboboxOpen);
																		},
																		type: 'button',
																		id: 'framework-dialog',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var fragment_9 = root_1();
																			var text_4 = $.first_child(fragment_9);
																			var node_10 = $.sibling(text_4);

																			IconPlaceholder(node_10, {
																				lucide: 'ChevronDownIcon',
																				tabler: 'IconChevronDown',
																				hugeicons: 'ArrowDown01Icon',
																				phosphor: 'CaretDownIcon',
																				remixicon: 'RiArrowDownSLine',
																				class: 'size-4 text-muted-foreground opacity-50'
																			});

																			$.template_effect(() => $.set_text(text_4, `${$.get(selectedValue) ?? "Select a framework" ?? ''} `));
																			$.append($$anchor, fragment_9);
																		},
																		$$slots: { default: true }
																	}));
																};

																$.component(node_9, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
																	Popover_Trigger($$anchor, {
																		get ref() {
																			return $.get(triggerRef);
																		},

																		set ref($$value) {
																			$.set(triggerRef, $$value, true);
																		},
																		child,
																		$$slots: { child: true }
																	});
																});
															}

															var node_11 = $.sibling(node_9, 2);

															$.component(node_11, () => Popover.Content, ($$anchor, Popover_Content) => {
																Popover_Content($$anchor, {
																	class: 'w-(--bits-popover-anchor-width) p-0',
																	align: 'start',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_12 = $.first_child(fragment_10);

																		$.component(node_12, () => Command.Root, ($$anchor, Command_Root) => {
																			Command_Root($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root();
																					var node_13 = $.first_child(fragment_11);

																					$.component(node_13, () => Command.Input, ($$anchor, Command_Input) => {
																						Command_Input($$anchor, { placeholder: 'Search framework...' });
																					});

																					var node_14 = $.sibling(node_13, 2);

																					$.component(node_14, () => Command.List, ($$anchor, Command_List) => {
																						Command_List($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_12 = root();
																								var node_15 = $.first_child(fragment_12);

																								$.component(node_15, () => Command.Empty, ($$anchor, Command_Empty) => {
																									Command_Empty($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_5 = $.text('No items found.');

																											$.append($$anchor, text_5);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_16 = $.sibling(node_15, 2);

																								$.component(node_16, () => Command.Group, ($$anchor, Command_Group) => {
																									Command_Group($$anchor, {
																										value: 'frameworks',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = $.comment();
																											var node_17 = $.first_child(fragment_13);

																											$.each(node_17, 16, () => frameworks, (framework) => framework, ($$anchor, framework) => {
																												var fragment_14 = $.comment();
																												var node_18 = $.first_child(fragment_14);

																												$.component(node_18, () => Command.Item, ($$anchor, Command_Item) => {
																													Command_Item($$anchor, {
																														get value() {
																															return framework;
																														},

																														onSelect: () => {
																															$.set(value, framework, true);
																															closeAndFocusTrigger();
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_15 = root_2();
																															var node_19 = $.first_child(fragment_15);

																															{
																																let $0 = $.derived(() => cn($.get(value) !== framework && "text-transparent"));

																																IconPlaceholder(node_19, {
																																	lucide: 'CheckIcon',
																																	tabler: 'IconCheck',
																																	hugeicons: 'Tick02Icon',
																																	phosphor: 'CheckIcon',
																																	remixicon: 'RiCheckLine',
																																	get class() {
																																		return $.get($0);
																																	}
																																});
																															}

																															var text_6 = $.sibling(node_19);

																															$.template_effect(() => $.set_text(text_6, ` ${framework ?? ''}`));
																															$.append($$anchor, fragment_15);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_14);
																											});

																											$.append($$anchor, fragment_13);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_12);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_10);
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
									});

									var node_20 = $.sibling(node_6, 2);

									$.component(node_20, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
										Dialog_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root();
												var node_21 = $.first_child(fragment_16);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Cancel');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_21, () => Dialog.Close, ($$anchor, Dialog_Close) => {
														Dialog_Close($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_22 = $.sibling(node_21, 2);

												Button(node_22, {
													type: 'button',
													onclick: () => {
														toast("Framework selected.");
														$.set(dialogOpen, false);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text('Confirm');

														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}