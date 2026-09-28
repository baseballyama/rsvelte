import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!> <span class="flex-1 py-1 text-sm text-muted-foreground"> </span></div>`);
var root_3 = $.from_html(`<!> <!> `, 1);

export default function Assign_issue($$anchor, $$props) {
	$.push($$props, true);

	const users = [
		"shadcn",
		"maxleiter",
		"evilrabbit",
		"pranathip",
		"jorgezreik",
		"shuding",
		"rauchg"
	];

	let open = $.state(false);
	let selected = $.state($.proxy(["shadcn"]));

	function toggleUser(username) {
		$.set(
			selected,
			$.get(selected).includes(username)
				? $.get(selected).filter((u) => u !== username)
				: [...$.get(selected), username],
			true
		);
	}

	function removeUser(e, username) {
		e.stopPropagation();
		$.set(selected, $.get(selected).filter((u) => u !== username), true);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'w-full max-w-sm',
			size: 'sm',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'border-b',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Assign Issue');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									class: 'text-sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Select users to assign to this issue.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
											Tooltip_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_6 = $.first_child(fragment_4);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;

															Button($$anchor, $.spread_props({ variant: 'outline', size: 'icon-xs' }, props, {
																children: ($$anchor, $$slotProps) => {
																	IconPlaceholder($$anchor, {
																		lucide: 'PlusIcon',
																		tabler: 'IconPlus',
																		hugeicons: 'PlusSignIcon',
																		phosphor: 'PlusIcon',
																		remixicon: 'RiAddLine'
																	});
																},
																$$slots: { default: true }
															}));
														};

														$.component(node_6, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
															Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
														Tooltip_Content($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Add user');

																$.append($$anchor, text_2);
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
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_1, 2);

				$.component(node_8, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_9 = $.first_child(fragment_7);

							$.component(node_9, () => Popover.Root, ($$anchor, Popover_Root) => {
								Popover_Root($$anchor, {
									get open() {
										return $.get(open);
									},

									set open($$value) {
										$.set(open, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_10 = $.first_child(fragment_8);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var div = root_2();

												$.attribute_effect(div, () => ({
													...props(),
													role: 'combobox',
													'aria-expanded': $.get(open),
													class: 'flex min-h-9 min-w-0 cursor-pointer flex-wrap items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-offset-2'
												}));

												var node_11 = $.child(div);

												$.each(node_11, 16, () => $.get(selected), (username) => username, ($$anchor, username) => {
													Badge($$anchor, {
														variant: 'secondary',
														class: 'gap-1 pr-0.5',
														onclick: (e) => removeUser(e, username),
														onkeydown: (e) => e.key === "Enter" && removeUser(e, username),
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root();
															var node_12 = $.first_child(fragment_10);

															$.component(node_12, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																Avatar_Root($$anchor, {
																	class: 'size-4',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = root();
																		var node_13 = $.first_child(fragment_11);

																		$.component(node_13, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																			Avatar_Image($$anchor, {
																				get src() {
																					return `https://github.com/${username ?? ''}.png`;
																				},

																				get alt() {
																					return username;
																				}
																			});
																		});

																		var node_14 = $.sibling(node_13, 2);

																		$.component(node_14, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																			Avatar_Fallback($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text();

																					$.template_effect(($0) => $.set_text(text_3, $0), [() => username.charAt(0)]);
																					$.append($$anchor, text_3);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_11);
																	},
																	$$slots: { default: true }
																});
															});

															var text_4 = $.sibling(node_12);
															var node_15 = $.sibling(text_4);

															IconPlaceholder(node_15, {
																lucide: 'XIcon',
																tabler: 'IconX',
																hugeicons: 'Cancel01Icon',
																phosphor: 'XIcon',
																remixicon: 'RiCloseLine',
																class: 'size-3'
															});

															$.template_effect(() => $.set_text(text_4, ` ${username ?? ''} `));
															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												var span = $.sibling(node_11, 2);
												var text_5 = $.only_child(span, true);

												$.reset(div);
												$.template_effect(() => $.set_text(text_5, $.get(selected).length > 0 ? "Select users..." : "Select a user..."));
												$.append($$anchor, div);
											};

											$.component(node_10, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
												Popover_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_16 = $.sibling(node_10, 2);

										$.component(node_16, () => Popover.Content, ($$anchor, Popover_Content) => {
											Popover_Content($$anchor, {
												class: 'w-(--bits-popover-trigger-width) p-0',
												align: 'start',
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = $.comment();
													var node_17 = $.first_child(fragment_13);

													$.component(node_17, () => Command.Root, ($$anchor, Command_Root) => {
														Command_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_14 = root();
																var node_18 = $.first_child(fragment_14);

																$.component(node_18, () => Command.Input, ($$anchor, Command_Input) => {
																	Command_Input($$anchor, { placeholder: 'Search users...' });
																});

																var node_19 = $.sibling(node_18, 2);

																$.component(node_19, () => Command.List, ($$anchor, Command_List) => {
																	Command_List($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_15 = root();
																			var node_20 = $.first_child(fragment_15);

																			$.component(node_20, () => Command.Empty, ($$anchor, Command_Empty) => {
																				Command_Empty($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_6 = $.text('No users found.');

																						$.append($$anchor, text_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_21 = $.sibling(node_20, 2);

																			$.component(node_21, () => Command.Group, ($$anchor, Command_Group) => {
																				Command_Group($$anchor, {
																					value: 'users',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_16 = $.comment();
																						var node_22 = $.first_child(fragment_16);

																						$.each(node_22, 16, () => users, (username) => username, ($$anchor, username) => {
																							var fragment_17 = $.comment();
																							var node_23 = $.first_child(fragment_17);

																							$.component(node_23, () => Command.Item, ($$anchor, Command_Item) => {
																								Command_Item($$anchor, {
																									get value() {
																										return username;
																									},
																									onSelect: () => toggleUser(username),
																									children: ($$anchor, $$slotProps) => {
																										var fragment_18 = root_3();
																										var node_24 = $.first_child(fragment_18);

																										{
																											let $0 = $.derived(() => cn(!$.get(selected).includes(username) && "text-transparent"));

																											IconPlaceholder(node_24, {
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

																										var node_25 = $.sibling(node_24, 2);

																										$.component(node_25, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																											Avatar_Root_1($$anchor, {
																												class: 'size-5',
																												children: ($$anchor, $$slotProps) => {
																													var fragment_19 = root();
																													var node_26 = $.first_child(fragment_19);

																													$.component(node_26, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																														Avatar_Image_1($$anchor, {
																															get src() {
																																return `https://github.com/${username ?? ''}.png`;
																															},

																															get alt() {
																																return username;
																															}
																														});
																													});

																													var node_27 = $.sibling(node_26, 2);

																													$.component(node_27, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																														Avatar_Fallback_1($$anchor, {
																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_7 = $.text();

																																$.template_effect(($0) => $.set_text(text_7, $0), [() => username.charAt(0)]);
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

																										var text_8 = $.sibling(node_25);

																										$.template_effect(() => $.set_text(text_8, ` ${username ?? ''}`));
																										$.append($$anchor, fragment_18);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_17);
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

													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}