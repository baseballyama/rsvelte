import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/registry/ui/command/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="flex flex-col gap-4"><!> <!></div>`);

export default function Combobox_multiple_invalid($$anchor, $$props) {
	$.push($$props, true);

	const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];
	let open = $.state(false);
	let openInvalid = $.state(false);
	let values = $.state($.proxy([frameworks[0], frameworks[1]]));
	let valuesInvalid = $.state($.proxy([frameworks[0], frameworks[1], frameworks[2]]));

	function toggleValue(framework, target) {
		const current = target === "default" ? $.get(values) : $.get(valuesInvalid);

		const setter = target === "default"
			? (v) => $.set(values, v, true)
			: (v) => $.set(valuesInvalid, v, true);

		setter(current.includes(framework)
			? current.filter((v) => v !== framework)
			: [...current, framework]);
	}

	function removeValue(e, framework, target) {
		e.stopPropagation();

		if (target === "default") {
			$.set(values, $.get(values).filter((v) => v !== framework), true);
		} else {
			$.set(valuesInvalid, $.get(valuesInvalid).filter((v) => v !== framework), true);
		}
	}

	Example($$anchor, {
		title: 'Combobox Multiple Invalid',
		children: ($$anchor, $$slotProps) => {
			var div = root_5();
			var node = $.child(div);

			$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_3();
						var node_1 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var div_1 = root_1();

								$.attribute_effect(div_1, () => ({
									...props(),
									role: 'combobox',
									'aria-expanded': $.get(open),
									'aria-invalid': true,
									class: 'flex min-h-9 w-64 cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm shadow-xs transition-colors focus-within:ring-[3px] focus-within:ring-offset-2 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'
								}));

								$.each(div_1, 20, () => $.get(values), (framework) => framework, ($$anchor, framework) => {
									Badge($$anchor, {
										variant: 'secondary',
										class: 'gap-1 pr-0.5',
										onclick: (e) => removeValue(e, framework, "default"),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_3 = root();
											var text = $.first_child(fragment_3);
											var node_2 = $.sibling(text);

											IconPlaceholder(node_2, {
												lucide: 'XIcon',
												tabler: 'IconX',
												hugeicons: 'Cancel01Icon',
												phosphor: 'XIcon',
												remixicon: 'RiCloseLine',
												class: 'size-3'
											});

											$.template_effect(() => $.set_text(text, `${framework ?? ''} `));
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.reset(div_1);
								$.append($$anchor, div_1);
							};

							$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
								Popover_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'w-64 p-0',
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => Command.Root, ($$anchor, Command_Root) => {
										Command_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_3();
												var node_5 = $.first_child(fragment_5);

												$.component(node_5, () => Command.Input, ($$anchor, Command_Input) => {
													Command_Input($$anchor, { placeholder: 'Search framework...' });
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Command.List, ($$anchor, Command_List) => {
													Command_List($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_3();
															var node_7 = $.first_child(fragment_6);

															$.component(node_7, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('No items found.');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_7, 2);

															$.component(node_8, () => Command.Group, ($$anchor, Command_Group) => {
																Command_Group($$anchor, {
																	value: 'frameworks',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = $.comment();
																		var node_9 = $.first_child(fragment_7);

																		$.each(node_9, 16, () => frameworks, (framework) => framework, ($$anchor, framework) => {
																			var fragment_8 = $.comment();
																			var node_10 = $.first_child(fragment_8);

																			$.component(node_10, () => Command.Item, ($$anchor, Command_Item) => {
																				Command_Item($$anchor, {
																					get value() {
																						return framework;
																					},
																					onSelect: () => toggleValue(framework, "default"),
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = root_2();
																						var node_11 = $.first_child(fragment_9);

																						{
																							let $0 = $.derived(() => cn(!$.get(values).includes(framework) && "text-transparent"));

																							IconPlaceholder(node_11, {
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

																						var text_2 = $.sibling(node_11);

																						$.template_effect(() => $.set_text(text_2, ` ${framework ?? ''}`));
																						$.append($$anchor, fragment_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_8);
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

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node, 2);

			$.component(node_12, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					'data-invalid': true,
					children: ($$anchor, $$slotProps) => {
						var fragment_10 = root_4();
						var node_13 = $.first_child(fragment_10);

						$.component(node_13, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'combobox-multiple-invalid',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Frameworks');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_13, 2);

						$.component(node_14, () => Popover.Root, ($$anchor, Popover_Root_1) => {
							Popover_Root_1($$anchor, {
								get open() {
									return $.get(openInvalid);
								},

								set open($$value) {
									$.set(openInvalid, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_3();
									var node_15 = $.first_child(fragment_11);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											var div_2 = root_1();

											$.attribute_effect(div_2, () => ({
												...props(),
												role: 'combobox',
												'aria-expanded': $.get(openInvalid),
												'aria-invalid': true,
												id: 'combobox-multiple-invalid',
												class: 'flex min-h-9 w-64 cursor-pointer flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm shadow-xs transition-colors focus-within:ring-[3px] focus-within:ring-offset-2 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'
											}));

											$.each(div_2, 20, () => $.get(valuesInvalid), (framework) => framework, ($$anchor, framework) => {
												Badge($$anchor, {
													variant: 'secondary',
													class: 'gap-1 pr-0.5',
													onclick: (e) => removeValue(e, framework, "invalid"),
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_13 = root();
														var text_4 = $.first_child(fragment_13);
														var node_16 = $.sibling(text_4);

														IconPlaceholder(node_16, {
															lucide: 'XIcon',
															tabler: 'IconX',
															hugeicons: 'Cancel01Icon',
															phosphor: 'XIcon',
															remixicon: 'RiCloseLine',
															class: 'size-3'
														});

														$.template_effect(() => $.set_text(text_4, `${framework ?? ''} `));
														$.append($$anchor, fragment_13);
													},
													$$slots: { default: true }
												});
											});

											$.reset(div_2);
											$.append($$anchor, div_2);
										};

										$.component(node_15, () => Popover.Trigger, ($$anchor, Popover_Trigger_1) => {
											Popover_Trigger_1($$anchor, { child, $$slots: { child: true } });
										});
									}

									var node_17 = $.sibling(node_15, 2);

									$.component(node_17, () => Popover.Content, ($$anchor, Popover_Content_1) => {
										Popover_Content_1($$anchor, {
											class: 'w-64 p-0',
											align: 'start',
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = $.comment();
												var node_18 = $.first_child(fragment_14);

												$.component(node_18, () => Command.Root, ($$anchor, Command_Root_1) => {
													Command_Root_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_15 = root_3();
															var node_19 = $.first_child(fragment_15);

															$.component(node_19, () => Command.Input, ($$anchor, Command_Input_1) => {
																Command_Input_1($$anchor, { placeholder: 'Search framework...' });
															});

															var node_20 = $.sibling(node_19, 2);

															$.component(node_20, () => Command.List, ($$anchor, Command_List_1) => {
																Command_List_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_16 = root_3();
																		var node_21 = $.first_child(fragment_16);

																		$.component(node_21, () => Command.Empty, ($$anchor, Command_Empty_1) => {
																			Command_Empty_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('No items found.');

																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_22 = $.sibling(node_21, 2);

																		$.component(node_22, () => Command.Group, ($$anchor, Command_Group_1) => {
																			Command_Group_1($$anchor, {
																				value: 'frameworks',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_17 = $.comment();
																					var node_23 = $.first_child(fragment_17);

																					$.each(node_23, 16, () => frameworks, (framework) => framework, ($$anchor, framework) => {
																						var fragment_18 = $.comment();
																						var node_24 = $.first_child(fragment_18);

																						$.component(node_24, () => Command.Item, ($$anchor, Command_Item_1) => {
																							Command_Item_1($$anchor, {
																								get value() {
																									return framework;
																								},
																								onSelect: () => toggleValue(framework, "invalid"),
																								children: ($$anchor, $$slotProps) => {
																									var fragment_19 = root_2();
																									var node_25 = $.first_child(fragment_19);

																									{
																										let $0 = $.derived(() => cn(!$.get(valuesInvalid).includes(framework) && "text-transparent"));

																										IconPlaceholder(node_25, {
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

																									var text_6 = $.sibling(node_25);

																									$.template_effect(() => $.set_text(text_6, ` ${framework ?? ''}`));
																									$.append($$anchor, fragment_19);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_18);
																					});

																					$.append($$anchor, fragment_17);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_16);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_15);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_14);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						var node_26 = $.sibling(node_14, 2);

						$.component(node_26, () => Field.Description, ($$anchor, Field_Description) => {
							Field_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Please select at least one framework.');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						});

						var node_27 = $.sibling(node_26, 2);

						$.component(node_27, () => Field.Error, ($$anchor, Field_Error) => {
							Field_Error($$anchor, { errors: [{ message: "This field is required." }] });
						});

						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}