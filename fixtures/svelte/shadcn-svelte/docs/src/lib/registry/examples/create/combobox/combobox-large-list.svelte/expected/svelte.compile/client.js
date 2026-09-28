import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Combobox_large_list($$anchor, $$props) {
	$.push($$props, true);

	const largeListItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
	let open = $.state(false);
	let value = $.state("");
	let triggerRef = $.state(null);

	function closeAndFocusTrigger() {
		$.set(open, false);

		tick().then(() => {
			$.get(triggerRef)?.focus();
		});
	}

	Example($$anchor, {
		title: 'Large List (100 items)',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(props, {
									variant: 'outline',
									class: 'w-[200px] justify-between font-normal',
									role: 'combobox',
									get 'aria-expanded'() {
										return $.get(open);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root();
										var text = $.first_child(fragment_4);
										var node_2 = $.sibling(text);

										IconPlaceholder(node_2, {
											lucide: 'ChevronDownIcon',
											tabler: 'IconChevronDown',
											hugeicons: 'ArrowDown01Icon',
											phosphor: 'CaretDownIcon',
											remixicon: 'RiArrowDownSLine',
											class: 'size-4 text-muted-foreground opacity-50'
										});

										$.template_effect(() => $.set_text(text, `${($.get(value) || "Search from 100 items") ?? ''} `));
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
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

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'max-h-72 w-[200px] p-0',
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_4 = $.first_child(fragment_5);

									$.component(node_4, () => Command.Root, ($$anchor, Command_Root) => {
										Command_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_2();
												var node_5 = $.first_child(fragment_6);

												$.component(node_5, () => Command.Input, ($$anchor, Command_Input) => {
													Command_Input($$anchor, { placeholder: 'Search...' });
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Command.List, ($$anchor, Command_List) => {
													Command_List($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_2();
															var node_7 = $.first_child(fragment_7);

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
																	value: 'items',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = $.comment();
																		var node_9 = $.first_child(fragment_8);

																		$.each(node_9, 16, () => largeListItems, (item) => item, ($$anchor, item) => {
																			var fragment_9 = $.comment();
																			var node_10 = $.first_child(fragment_9);

																			$.component(node_10, () => Command.Item, ($$anchor, Command_Item) => {
																				Command_Item($$anchor, {
																					get value() {
																						return item;
																					},

																					onSelect: () => {
																						$.set(value, item, true);
																						closeAndFocusTrigger();
																					},

																					children: ($$anchor, $$slotProps) => {
																						var fragment_10 = root_1();
																						var node_11 = $.first_child(fragment_10);

																						{
																							let $0 = $.derived(() => cn($.get(value) !== item && "text-transparent"));

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

																						$.template_effect(() => $.set_text(text_2, ` ${item ?? ''}`));
																						$.append($$anchor, fragment_10);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_9);
																		});

																		$.append($$anchor, fragment_8);
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

									$.append($$anchor, fragment_5);
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