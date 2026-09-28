import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import CirclePlusIcon from "@lucide/svelte/icons/circle-plus";
import { SvelteSet } from "svelte/reactivity";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> <!> <div class="hidden space-x-1 lg:flex"><!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span class="ms-auto flex size-4 items-center justify-center font-mono text-xs"> </span>`);
var root_3 = $.from_html(`<div><!></div> <!> <span> </span> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Data_table_faceted_filter($$anchor, $$props) {
	$.push($$props, true);

	const facets = $.derived(() => $$props.column?.getFacetedUniqueValues());
	const selectedValues = $.derived(() => new SvelteSet($$props.column?.getFilterValue()));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							size: 'sm',
							class: 'h-8 border-dashed',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_2 = $.first_child(fragment_3);

								CirclePlusIcon(node_2, {});

								var text = $.sibling(node_2);
								var node_3 = $.sibling(text);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_4 = root();
										var node_4 = $.first_child(fragment_4);

										Separator(node_4, { orientation: 'vertical', class: 'mx-2 h-4' });

										var node_5 = $.sibling(node_4, 2);

										Badge(node_5, {
											variant: 'secondary',
											class: 'rounded-sm px-1 font-normal lg:hidden',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $.get(selectedValues).size));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										var div = $.sibling(node_5, 2);
										var node_6 = $.child(div);

										{
											var consequent = ($$anchor) => {
												Badge($$anchor, {
													variant: 'secondary',
													class: 'rounded-sm px-1 font-normal',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, `${$.get(selectedValues).size ?? ''} selected`));
														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											};

											var alternate = ($$anchor) => {
												var fragment_8 = $.comment();
												var node_7 = $.first_child(fragment_8);

												$.each(node_7, 16, () => $$props.options.filter((opt) => $.get(selectedValues).has(opt.value)), (option) => option, ($$anchor, option) => {
													Badge($$anchor, {
														variant: 'secondary',
														class: 'rounded-sm px-1 font-normal',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text();

															$.template_effect(() => $.set_text(text_3, option.label));
															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											};

											$.if(node_6, ($$render) => {
												if ($.get(selectedValues).size > 2) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.reset(div);
										$.append($$anchor, fragment_4);
									};

									$.if(node_3, ($$render) => {
										if ($.get(selectedValues).size > 0) $$render(consequent_1);
									});
								}

								$.template_effect(() => $.set_text(text, ` ${$$props.title ?? ''} `));
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_8 = $.sibling(node_1, 2);

				$.component(node_8, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-[200px] p-0',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = $.comment();
							var node_9 = $.first_child(fragment_11);

							$.component(node_9, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_1();
										var node_10 = $.first_child(fragment_12);

										$.component(node_10, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, {
												get placeholder() {
													return $$props.title;
												}
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = root_4();
													var node_12 = $.first_child(fragment_13);

													$.component(node_12, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('No results found.');

																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_13 = $.sibling(node_12, 2);

													$.component(node_13, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = $.comment();
																var node_14 = $.first_child(fragment_14);

																$.each(node_14, 16, () => $$props.options, (option) => option, ($$anchor, option) => {
																	const isSelected = $.derived(() => $.get(selectedValues).has(option.value));
																	var fragment_15 = $.comment();
																	var node_15 = $.first_child(fragment_15);

																	$.component(node_15, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			onSelect: () => {
																				if ($.get(isSelected)) {
																					$.get(selectedValues).delete(option.value);
																				} else {
																					$.get(selectedValues).add(option.value);
																				}

																				const filterValues = Array.from($.get(selectedValues));

																				$$props.column?.setFilterValue(filterValues.length ? filterValues : undefined);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_16 = root_3();
																				var div_1 = $.first_child(fragment_16);
																				var node_16 = $.child(div_1);

																				CheckIcon(node_16, { class: 'size-4' });
																				$.reset(div_1);

																				var node_17 = $.sibling(div_1, 2);

																				{
																					var consequent_2 = ($$anchor) => {
																						const Icon = $.derived(() => option.icon);
																						var fragment_17 = $.comment();
																						var node_18 = $.first_child(fragment_17);

																						$.component(node_18, () => $.get(Icon), ($$anchor, Icon_1) => {
																							Icon_1($$anchor, { class: 'text-muted-foreground' });
																						});

																						$.append($$anchor, fragment_17);
																					};

																					$.if(node_17, ($$render) => {
																						if (option.icon) $$render(consequent_2);
																					});
																				}

																				var span = $.sibling(node_17, 2);
																				var text_5 = $.only_child(span, true);
																				var node_19 = $.sibling(span, 2);

																				{
																					var consequent_3 = ($$anchor) => {
																						var span_1 = root_2();
																						var text_6 = $.only_child(span_1, true);

																						$.template_effect(($0) => $.set_text(text_6, $0), [() => $.get(facets).get(option.value)]);
																						$.append($$anchor, span_1);
																					};

																					var d = $.derived(() => $.get(facets)?.get(option.value));

																					$.if(node_19, ($$render) => {
																						if ($.get(d)) $$render(consequent_3);
																					});
																				}

																				$.template_effect(
																					($0) => {
																						$.set_class(div_1, 1, $0);
																						$.set_text(text_5, option.label);
																					},
																					[
																						() => $.clsx(cn("me-2 flex size-4 items-center justify-center rounded-sm border border-primary", $.get(isSelected)
																							? "bg-primary text-primary-foreground"
																							: "opacity-50 [&_svg]:invisible"))
																					]
																				);

																				$.append($$anchor, fragment_16);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_15);
																});

																$.append($$anchor, fragment_14);
															},
															$$slots: { default: true }
														});
													});

													var node_20 = $.sibling(node_13, 2);

													{
														var consequent_4 = ($$anchor) => {
															var fragment_18 = root_1();
															var node_21 = $.first_child(fragment_18);

															$.component(node_21, () => Command.Separator, ($$anchor, Command_Separator) => {
																Command_Separator($$anchor, {});
															});

															var node_22 = $.sibling(node_21, 2);

															$.component(node_22, () => Command.Group, ($$anchor, Command_Group_1) => {
																Command_Group_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_19 = $.comment();
																		var node_23 = $.first_child(fragment_19);

																		$.component(node_23, () => Command.Item, ($$anchor, Command_Item_1) => {
																			Command_Item_1($$anchor, {
																				onSelect: () => $$props.column?.setFilterValue(undefined),
																				class: 'justify-center text-center',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_7 = $.text('Clear filters');

																					$.append($$anchor, text_7);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_19);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_18);
														};

														$.if(node_20, ($$render) => {
															if ($.get(selectedValues).size > 0) $$render(consequent_4);
														});
													}

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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}