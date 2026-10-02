import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex h-[calc(--spacing(4.75))] w-fit items-center justify-center gap-1 rounded-[calc(var(--radius-sm)-2px)] bg-muted-foreground/10 px-1.5 text-xs/relaxed font-medium whitespace-nowrap text-foreground"><!> <button type="button" class="-ml-1 opacity-50 hover:opacity-100"><!></button></div>`);
var root_3 = $.from_html(`<div><!> <input type="text" class="min-w-[120px] flex-1 border-none bg-transparent outline-none"/></div>`);
var root_4 = $.from_html(`<!> `, 1);

export default function Assign_issue($$anchor) {
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
	let selectedUsers = $.state($.proxy([users[0]]));

	function toggleUser(username) {
		if ($.get(selectedUsers).includes(username)) {
			$.set(selectedUsers, $.get(selectedUsers).filter((u) => u !== username), true);
		} else {
			$.set(selectedUsers, [...$.get(selectedUsers), username], true);
		}
	}

	function removeUser(username, event) {
		event.stopPropagation();
		$.set(selectedUsers, $.get(selectedUsers).filter((u) => u !== username), true);
	}

	Example($$anchor, {
		title: 'User Select',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'w-full max-w-sm',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								class: 'border-b',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_2 = $.first_child(fragment_3);

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
												var fragment_4 = $.comment();
												var node_5 = $.first_child(fragment_4);

												$.component(node_5, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
													Tooltip_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_6 = $.first_child(fragment_5);

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
						});

						var node_8 = $.sibling(node_1, 2);

						$.component(node_8, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = $.comment();
									var node_9 = $.first_child(fragment_8);

									$.component(node_9, () => Popover.Root, ($$anchor, Popover_Root) => {
										Popover_Root($$anchor, {
											get open() {
												return $.get(open);
											},

											set open($$value) {
												$.set(open, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root();
												var node_10 = $.first_child(fragment_9);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var div = root_3();

														$.attribute_effect(div, () => ({
															...props(),
															class: 'flex min-h-7 cursor-pointer flex-wrap items-center gap-1 rounded-md border border-input bg-input/20 bg-clip-padding px-1 py-0.5 text-xs/relaxed transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30 dark:bg-input/30',
															role: 'button'
														}));

														var node_11 = $.child(div);

														$.each(node_11, 16, () => $.get(selectedUsers), (username) => username, ($$anchor, username) => {
															var div_1 = root_2();
															var node_12 = $.child(div_1);

															$.component(node_12, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																Avatar_Root($$anchor, {
																	class: 'size-4',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root();
																		var node_13 = $.first_child(fragment_10);

																		{
																			let $0 = $.derived(() => `https://github.com/${username}.png`);

																			$.component(node_13, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																				Avatar_Image($$anchor, {
																					get src() {
																						return $.get($0);
																					},

																					get alt() {
																						return username;
																					}
																				});
																			});
																		}

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

																		$.append($$anchor, fragment_10);
																	},
																	$$slots: { default: true }
																});
															});

															var text_4 = $.sibling(node_12);
															var button = $.sibling(text_4);
															var node_15 = $.child(button);

															IconPlaceholder(node_15, {
																lucide: 'XIcon',
																tabler: 'IconX',
																hugeicons: 'Cancel01Icon',
																phosphor: 'XIcon',
																remixicon: 'RiCloseLine',
																class: 'size-3'
															});

															$.reset(button);
															$.reset(div_1);

															$.template_effect(() => {
																$.set_text(text_4, ` ${username ?? ''} `);
																$.set_attribute(button, 'aria-label', `Remove ${username}`);
															});

															$.delegated('click', button, (e) => removeUser(username, e));
															$.append($$anchor, div_1);
														});

														var input = $.sibling(node_11, 2);

														$.reset(div);
														$.template_effect(() => $.set_attribute(input, 'placeholder', $.get(selectedUsers).length > 0 ? undefined : "Select a item..."));
														$.append($$anchor, div);
													};

													$.component(node_10, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
														Popover_Trigger($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_16 = $.sibling(node_10, 2);

												$.component(node_16, () => Popover.Content, ($$anchor, Popover_Content) => {
													Popover_Content($$anchor, {
														class: 'w-[var(--bits-popover-trigger-width)] p-0',
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = $.comment();
															var node_17 = $.first_child(fragment_12);

															$.component(node_17, () => Command.Root, ($$anchor, Command_Root) => {
																Command_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_13 = root();
																		var node_18 = $.first_child(fragment_13);

																		$.component(node_18, () => Command.Input, ($$anchor, Command_Input) => {
																			Command_Input($$anchor, { placeholder: 'Search users...' });
																		});

																		var node_19 = $.sibling(node_18, 2);

																		$.component(node_19, () => Command.List, ($$anchor, Command_List) => {
																			Command_List($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = root();
																					var node_20 = $.first_child(fragment_14);

																					$.component(node_20, () => Command.Empty, ($$anchor, Command_Empty) => {
																						Command_Empty($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_5 = $.text('No users found.');

																								$.append($$anchor, text_5);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_21 = $.sibling(node_20, 2);

																					$.component(node_21, () => Command.Group, ($$anchor, Command_Group) => {
																						Command_Group($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_15 = $.comment();
																								var node_22 = $.first_child(fragment_15);

																								$.each(node_22, 16, () => users, (username) => username, ($$anchor, username) => {
																									var fragment_16 = $.comment();
																									var node_23 = $.first_child(fragment_16);

																									{
																										let $0 = $.derived(() => $.get(selectedUsers).includes(username));

																										$.component(node_23, () => Command.Item, ($$anchor, Command_Item) => {
																											Command_Item($$anchor, {
																												get value() {
																													return username;
																												},

																												onSelect: () => {
																													toggleUser(username);
																												},

																												get 'data-checked'() {
																													return $.get($0);
																												},

																												children: ($$anchor, $$slotProps) => {
																													var fragment_17 = root_4();
																													var node_24 = $.first_child(fragment_17);

																													$.component(node_24, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																														Avatar_Root_1($$anchor, {
																															class: 'size-5',
																															children: ($$anchor, $$slotProps) => {
																																var fragment_18 = root();
																																var node_25 = $.first_child(fragment_18);

																																{
																																	let $0 = $.derived(() => `https://github.com/${username}.png`);

																																	$.component(node_25, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																																		Avatar_Image_1($$anchor, {
																																			get src() {
																																				return $.get($0);
																																			},

																																			get alt() {
																																				return username;
																																			}
																																		});
																																	});
																																}

																																var node_26 = $.sibling(node_25, 2);

																																$.component(node_26, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																																	Avatar_Fallback_1($$anchor, {
																																		children: ($$anchor, $$slotProps) => {
																																			$.next();

																																			var text_6 = $.text();

																																			$.template_effect(($0) => $.set_text(text_6, $0), [() => username.charAt(0)]);
																																			$.append($$anchor, text_6);
																																		},
																																		$$slots: { default: true }
																																	});
																																});

																																$.append($$anchor, fragment_18);
																															},
																															$$slots: { default: true }
																														});
																													});

																													var text_7 = $.sibling(node_24);

																													$.template_effect(() => $.set_text(text_7, ` ${username ?? ''}`));
																													$.append($$anchor, fragment_17);
																												},
																												$$slots: { default: true }
																											});
																										});
																									}

																									$.append($$anchor, fragment_16);
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

															$.append($$anchor, fragment_12);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
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
}

$.delegate(['click']);