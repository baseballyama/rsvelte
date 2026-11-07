import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col"><p class="text-sm font-medium"> </p> <p class="text-muted-foreground"> </p></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Team_members($$anchor, $$props) {
	$.push($$props, true);

	let members = $.proxy([
		{
			name: "Sofia Davis",
			email: "m@example.com",
			role: "Owner",
			avatar: "/avatars/01.png"
		},

		{
			name: "Jackson Lee",
			email: "p@example.com",
			role: "Developer",
			avatar: "/avatars/02.png"
		},

		{
			name: "Isabella Nguyen",
			email: "i@example.com",
			role: "Billing",
			avatar: "/avatars/03.png"
		}
	]);

	const roles = [
		{ name: "Viewer", description: "Can view and comment." },
		{
			name: "Developer",
			description: "Can view, comment and edit."
		},

		{
			name: "Billing",
			description: "Can view, comment and manage billing."
		},

		{
			name: "Owner",
			description: "Admin-level access to all resources."
		}
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'gap-4',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Team Members');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Invite your team members to collaborate.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.each(node_5, 17, () => members, (member) => member.name, ($$anchor, member, $$index_1) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => Item.Item, ($$anchor, Item_Item) => {
									Item_Item($$anchor, {
										size: 'sm',
										class: 'gap-4 px-0',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_3();
											var node_7 = $.first_child(fragment_5);

											$.component(node_7, () => Avatar.Root, ($$anchor, Avatar_Root) => {
												Avatar_Root($$anchor, {
													class: 'shrink-0 self-start border',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root();
														var node_8 = $.first_child(fragment_6);

														$.component(node_8, () => Avatar.Image, ($$anchor, Avatar_Image) => {
															Avatar_Image($$anchor, {
																get src() {
																	return $.get(member).avatar;
																},
																alt: 'Image'
															});
														});

														var node_9 = $.sibling(node_8, 2);

														$.component(node_9, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
															Avatar_Fallback($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text();

																	$.template_effect(($0) => $.set_text(text_2, $0), [
																		() => $.get(member).name.split(" ").map((n) => n[0]).join("")
																	]);

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var node_10 = $.sibling(node_7, 2);

											$.component(node_10, () => Item.Content, ($$anchor, Item_Content) => {
												Item_Content($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root();
														var node_11 = $.first_child(fragment_8);

														$.component(node_11, () => Item.Title, ($$anchor, Item_Title) => {
															Item_Title($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text();

																	$.template_effect(() => $.set_text(text_3, $.get(member).name));
																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														var node_12 = $.sibling(node_11, 2);

														$.component(node_12, () => Item.Description, ($$anchor, Item_Description) => {
															Item_Description($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text();

																	$.template_effect(() => $.set_text(text_4, $.get(member).email));
																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});

											var node_13 = $.sibling(node_10, 2);

											$.component(node_13, () => Item.Actions, ($$anchor, Item_Actions) => {
												Item_Actions($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_11 = $.comment();
														var node_14 = $.first_child(fragment_11);

														$.component(node_14, () => Popover.Root, ($$anchor, Popover_Root) => {
															Popover_Root($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = root();
																	var node_15 = $.first_child(fragment_12);

																	{
																		let $0 = $.derived(() => buttonVariants({ variant: "outline", size: "sm", class: "ms-auto shadow-none" }));

																		$.component(node_15, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
																			Popover_Trigger($$anchor, {
																				get class() {
																					return $.get($0);
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var fragment_13 = root_1();
																					var text_5 = $.first_child(fragment_13);
																					var node_16 = $.sibling(text_5);

																					ChevronDownIcon(node_16, {});
																					$.template_effect(() => $.set_text(text_5, `${$.get(member).role ?? ''} `));
																					$.append($$anchor, fragment_13);
																				},
																				$$slots: { default: true }
																			});
																		});
																	}

																	var node_17 = $.sibling(node_15, 2);

																	$.component(node_17, () => Popover.Content, ($$anchor, Popover_Content) => {
																		Popover_Content($$anchor, {
																			class: 'p-0',
																			align: 'end',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_14 = $.comment();
																				var node_18 = $.first_child(fragment_14);

																				$.component(node_18, () => Command.Root, ($$anchor, Command_Root) => {
																					Command_Root($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_15 = root();
																							var node_19 = $.first_child(fragment_15);

																							$.component(node_19, () => Command.Input, ($$anchor, Command_Input) => {
																								Command_Input($$anchor, { placeholder: 'Select role...' });
																							});

																							var node_20 = $.sibling(node_19, 2);

																							$.component(node_20, () => Command.List, ($$anchor, Command_List) => {
																								Command_List($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_16 = root();
																										var node_21 = $.first_child(fragment_16);

																										$.component(node_21, () => Command.Empty, ($$anchor, Command_Empty) => {
																											Command_Empty($$anchor, {
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_6 = $.text('No roles found.');

																													$.append($$anchor, text_6);
																												},
																												$$slots: { default: true }
																											});
																										});

																										var node_22 = $.sibling(node_21, 2);

																										$.component(node_22, () => Command.Group, ($$anchor, Command_Group) => {
																											Command_Group($$anchor, {
																												children: ($$anchor, $$slotProps) => {
																													var fragment_17 = $.comment();
																													var node_23 = $.first_child(fragment_17);

																													$.each(node_23, 17, () => roles, (role) => role.name, ($$anchor, role) => {
																														var fragment_18 = $.comment();
																														var node_24 = $.first_child(fragment_18);

																														$.component(node_24, () => Command.Item, ($$anchor, Command_Item) => {
																															Command_Item($$anchor, {
																																onSelect: () => ($.get(member).role = $.get(role).name),
																																children: ($$anchor, $$slotProps) => {
																																	var div = root_2();
																																	var p = $.child(div);
																																	var text_7 = $.only_child(p, true);
																																	var p_1 = $.sibling(p, 2);
																																	var text_8 = $.only_child(p_1, true);

																																	$.reset(div);

																																	$.template_effect(() => {
																																		$.set_text(text_7, $.get(role).name);
																																		$.set_text(text_8, $.get(role).description);
																																	});

																																	$.append($$anchor, div);
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

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
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