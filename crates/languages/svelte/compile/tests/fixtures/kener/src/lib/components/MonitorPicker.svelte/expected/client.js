import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Command from "$lib/components/ui/command/index.js";
import * as Popover from "$lib/components/ui/popover/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import CheckIcon from "@lucide/svelte/icons/check";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import ListPlusIcon from "@lucide/svelte/icons/list-plus";
import clientResolver from "$lib/client/resolver.js";
import { resolve } from "$app/paths";

var root = $.from_html(`<span class="text-muted-foreground"> </span> <!>`, 1);
var root_1 = $.from_html(`<img class="size-5 rounded object-cover"/>`);
var root_2 = $.from_html(`<div class="bg-muted flex size-5 items-center justify-center rounded text-[10px] font-medium"> </div>`);
var root_3 = $.from_html(`<!> <!> <span class="truncate"> </span> <span class="text-muted-foreground ml-auto truncate text-xs"> </span>`, 1);
var root_4 = $.from_html(`<!> `, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function MonitorPicker($$anchor, $$props) {
	$.push($$props, true);

	let monitors = $.prop($$props, 'monitors', 19, () => []),
		selectedTags = $.prop($$props, 'selectedTags', 19, () => []),
		placeholder = $.prop($$props, 'placeholder', 3, "Search monitors to add...");

	let open = $.state(false);
	let search = $.state("");

	// Own filtering (shouldFilter={false}) so "Add all matching" counts stay
	// consistent with what the list shows. Case-insensitive over name + tag.
	const filteredMonitors = $.derived(() => {
		const query = $.get(search).trim().toLowerCase();

		if (!query) return monitors();

		return monitors().filter((m) => m.name.toLowerCase().includes(query) || m.tag.toLowerCase().includes(query));
	});

	const unselectedMatches = $.derived(() => $.get(filteredMonitors).filter((m) => !selectedTags().includes(m.tag)));
	const showAddAll = $.derived(() => !!$.get(search).trim() && $.get(unselectedMatches).length > 0 && !!$$props.onAddMany);

	function addAllMatching() {
		$$props.onAddMany?.($.get(unselectedMatches).map((m) => m.tag));
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							role: 'combobox',
							get 'aria-expanded'() {
								return $.get(open);
							},
							class: 'w-full justify-between font-normal',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var span = $.first_child(fragment_3);
								var text = $.only_child(span, true);
								var node_2 = $.sibling(span, 2);

								ChevronsUpDownIcon(node_2, { class: 'text-muted-foreground size-4 shrink-0' });
								$.template_effect(() => $.set_text(text, placeholder()));
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-[var(--bits-popover-trigger-width)] p-0',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									shouldFilter: false,
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_5();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, {
												get placeholder() {
													return placeholder();
												},

												get value() {
													return $.get(search);
												},

												set value($$value) {
													$.set(search, $$value, true);
												}
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												class: 'max-h-64',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_6();
													var node_7 = $.first_child(fragment_6);

													$.component(node_7, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('No monitors found.');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_7 = $.comment();
																var node_9 = $.first_child(fragment_7);

																$.each(node_9, 17, () => $.get(filteredMonitors), (monitor) => monitor.tag, ($$anchor, monitor) => {
																	const selected = $.derived(() => selectedTags().includes($.get(monitor).tag));
																	var fragment_8 = $.comment();
																	var node_10 = $.first_child(fragment_8);

																	$.component(node_10, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			get value() {
																				return $.get(monitor).tag;
																			},
																			onSelect: () => $$props.onToggle($.get(monitor).tag),
																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = root_3();
																				var node_11 = $.first_child(fragment_9);

																				{
																					let $0 = $.derived(() => $.get(selected) ? 'opacity-100' : 'opacity-0');

																					CheckIcon(node_11, {
																						get class() {
																							return `size-4 ${$.get($0) ?? ''}`;
																						}
																					});
																				}

																				var node_12 = $.sibling(node_11, 2);

																				{
																					var consequent = ($$anchor) => {
																						var img = root_1();

																						$.template_effect(
																							($0) => {
																								$.set_attribute(img, 'src', $0);
																								$.set_attribute(img, 'alt', $.get(monitor).name);
																							},
																							[() => clientResolver(resolve, $.get(monitor).image)]
																						);

																						$.append($$anchor, img);
																					};

																					var alternate = ($$anchor) => {
																						var div = root_2();
																						var text_2 = $.only_child(div, true);

																						$.template_effect(($0) => $.set_text(text_2, $0), [() => $.get(monitor).name.charAt(0).toUpperCase()]);
																						$.append($$anchor, div);
																					};

																					$.if(node_12, ($$render) => {
																						if ($.get(monitor).image) $$render(consequent); else $$render(alternate, -1);
																					});
																				}

																				var span_1 = $.sibling(node_12, 2);
																				var text_3 = $.only_child(span_1, true);
																				var span_2 = $.sibling(span_1, 2);
																				var text_4 = $.only_child(span_2, true);

																				$.template_effect(() => {
																					$.set_text(text_3, $.get(monitor).name);
																					$.set_text(text_4, $.get(monitor).tag);
																				});

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

													var node_13 = $.sibling(node_8, 2);

													{
														var consequent_1 = ($$anchor) => {
															var fragment_10 = root_5();
															var node_14 = $.first_child(fragment_10);

															$.component(node_14, () => Command.Separator, ($$anchor, Command_Separator) => {
																Command_Separator($$anchor, {});
															});

															var node_15 = $.sibling(node_14, 2);

															$.component(node_15, () => Command.Group, ($$anchor, Command_Group_1) => {
																Command_Group_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = $.comment();
																		var node_16 = $.first_child(fragment_11);

																		$.component(node_16, () => Command.Item, ($$anchor, Command_Item_1) => {
																			Command_Item_1($$anchor, {
																				value: '__add-all-matching__',
																				onSelect: addAllMatching,
																				children: ($$anchor, $$slotProps) => {
																					var fragment_12 = root_4();
																					var node_17 = $.first_child(fragment_12);

																					ListPlusIcon(node_17, { class: 'size-4' });

																					var text_5 = $.sibling(node_17);

																					$.template_effect(() => $.set_text(text_5, ` Add all ${$.get(unselectedMatches).length ?? ''} matching`));
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
														};

														$.if(node_13, ($$render) => {
															if ($.get(showAddAll)) $$render(consequent_1);
														});
													}

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

	$.append($$anchor, fragment);
	$.pop();
}