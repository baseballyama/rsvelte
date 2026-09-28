import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import CheckIcon from "@lucide/svelte/icons/check";
import PlusIcon from "@lucide/svelte/icons/plus";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">New message</span>`, 1);
var root_2 = $.from_html(`<div class="flex items-center gap-4"><!> <div class="flex flex-col gap-0.5"><p class="text-sm leading-none font-medium">Sofia Davis</p> <p class="text-xs text-muted-foreground">m@example.com</p></div></div> <!>`, 1);
var root_3 = $.from_html(`<div> </div>`);
var root_4 = $.from_html(`<div class="flex flex-col gap-4"></div>`);
var root_5 = $.from_html(`<!> <span class="sr-only">Send</span>`, 1);
var root_6 = $.from_html(`<form class="relative w-full"><!></form>`);
var root_7 = $.from_html(`<!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <div class="ms-2"><p class="text-sm leading-none font-medium"> </p> <p class="text-sm text-muted-foreground"> </p></div> <!>`, 1);
var root_9 = $.from_html(`<div class="flex -space-x-2 overflow-hidden"></div>`);
var root_10 = $.from_html(`<p class="text-sm text-muted-foreground">Select users to add to this thread.</p>`);

export default function Chat($$anchor, $$props) {
	$.push($$props, true);

	const users = [
		{
			name: "Olivia Martin",
			email: "m@example.com",
			avatar: "/avatars/01.png"
		},

		{
			name: "Isabella Nguyen",
			email: "isabella.nguyen@email.com",
			avatar: "/avatars/03.png"
		},

		{
			name: "Emma Wilson",
			email: "emma@example.com",
			avatar: "/avatars/05.png"
		},

		{
			name: "Jackson Lee",
			email: "lee@example.com",
			avatar: "/avatars/02.png"
		},

		{
			name: "William Kim",
			email: "will@email.com",
			avatar: "/avatars/04.png"
		}
	];

	let open = $.state(false);
	let selectedUsers = $.state($.proxy([]));

	let messages = $.proxy([
		{ role: "agent", content: "Hi, how can I help you today?" },
		{
			role: "user",
			content: "Hey, I'm having trouble with my account."
		},
		{ role: "agent", content: "What seems to be the problem?" },
		{ role: "user", content: "I can't log in." }
	]);

	let input = $.state("");
	let inputLength = $.derived(() => $.get(input).trim().length);
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_7();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'flex flex-row items-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var div = $.first_child(fragment_2);
							var node_2 = $.child(div);

							$.component(node_2, () => Avatar.Root, ($$anchor, Avatar_Root) => {
								Avatar_Root($$anchor, {
									class: 'border',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Avatar.Image, ($$anchor, Avatar_Image) => {
											Avatar_Image($$anchor, { src: '/avatars/01.png', alt: 'Image' });
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
											Avatar_Fallback($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('OM');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.next(2);
							$.reset(div);

							var node_5 = $.sibling(div, 2);

							$.component(node_5, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
								Tooltip_Provider($$anchor, {
									delayDuration: 0,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
											Tooltip_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;

															Button($$anchor, $.spread_props(props, {
																size: 'icon',
																variant: 'secondary',
																class: 'ms-auto size-8 rounded-full',
																onclick: () => $.set(open, true),
																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = root_1();
																	var node_8 = $.first_child(fragment_7);

																	PlusIcon(node_8, {});
																	$.next(2);
																	$.append($$anchor, fragment_7);
																},
																$$slots: { default: true }
															}));
														};

														$.component(node_7, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
															Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_9 = $.sibling(node_7, 2);

													$.component(node_9, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
														Tooltip_Content($$anchor, {
															sideOffset: 10,
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('New message');

																$.append($$anchor, text_1);
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

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_1, 2);

				$.component(node_10, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_4();

							$.each(div_1, 21, () => messages, $.index, ($$anchor, message) => {
								var div_2 = root_3();
								var text_2 = $.only_child(div_2, true);

								$.template_effect(
									($0) => {
										$.set_class(div_2, 1, $0);
										$.set_text(text_2, $.get(message).content);
									},
									[
										() => $.clsx(cn("flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm", $.get(message).role === "user"
											? "ms-auto bg-primary text-primary-foreground"
											: "bg-muted"))
									]
								);

								$.append($$anchor, div_2);
							});

							$.reset(div_1);
							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var form = root_6();
							var node_12 = $.child(form);

							$.component(node_12, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
								InputGroup_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_13 = $.first_child(fragment_8);

										$.component(node_13, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
											InputGroup_Input($$anchor, {
												id: 'message',
												placeholder: 'Type your message...',
												autocomplete: 'off',
												get value() {
													return $.get(input);
												},

												set value($$value) {
													$.set(input, $$value, true);
												}
											});
										});

										var node_14 = $.sibling(node_13, 2);

										$.component(node_14, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
											InputGroup_Addon($$anchor, {
												align: 'inline-end',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_15 = $.first_child(fragment_9);

													$.component(node_15, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
														InputGroup_Button($$anchor, {
															type: 'submit',
															size: 'icon-xs',
															class: 'rounded-full',
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_5();
																var node_16 = $.first_child(fragment_10);

																ArrowUpIcon(node_16, {});
																$.next(2);
																$.append($$anchor, fragment_10);
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

							$.reset(form);

							$.event('submit', form, (event) => {
								event.preventDefault();

								if ($.get(inputLength) === 0) return;

								messages.push({ role: "user", content: $.get(input) });
								$.set(input, "");
							});

							$.append($$anchor, form);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_17 = $.sibling(node, 2);

	$.component(node_17, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_11 = $.comment();
				var node_18 = $.first_child(fragment_11);

				$.component(node_18, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'gap-0 p-0 outline-none',
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_7();
							var node_19 = $.first_child(fragment_12);

							$.component(node_19, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									class: 'px-4 pt-5 pb-4',
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = root();
										var node_20 = $.first_child(fragment_13);

										$.component(node_20, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('New message');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_20, 2);

										$.component(node_21, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Invite a user to this thread. This will create a new group message.');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								});
							});

							var node_22 = $.sibling(node_19, 2);

							$.component(node_22, () => Command.Root, ($$anchor, Command_Root) => {
								Command_Root($$anchor, {
									class: 'overflow-hidden rounded-t-none border-t bg-transparent',
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root();
										var node_23 = $.first_child(fragment_14);

										$.component(node_23, () => Command.Input, ($$anchor, Command_Input) => {
											Command_Input($$anchor, { placeholder: 'Search user...' });
										});

										var node_24 = $.sibling(node_23, 2);

										$.component(node_24, () => Command.List, ($$anchor, Command_List) => {
											Command_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root();
													var node_25 = $.first_child(fragment_15);

													$.component(node_25, () => Command.Empty, ($$anchor, Command_Empty) => {
														Command_Empty($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('No users found.');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													var node_26 = $.sibling(node_25, 2);

													$.component(node_26, () => Command.Group, ($$anchor, Command_Group) => {
														Command_Group($$anchor, {
															class: 'p-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = $.comment();
																var node_27 = $.first_child(fragment_16);

																$.each(node_27, 17, () => users, (user) => user.email, ($$anchor, user) => {
																	var fragment_17 = $.comment();
																	var node_28 = $.first_child(fragment_17);

																	$.component(node_28, () => Command.Item, ($$anchor, Command_Item) => {
																		Command_Item($$anchor, {
																			class: 'data-[active=true]:opacity-50',
																			onSelect: () => {
																				if ($.get(selectedUsers).includes($.get(user))) {
																					$.set(selectedUsers, $.get(selectedUsers).filter((u) => u.email !== $.get(user).email), true);
																				} else {
																					$.set(selectedUsers, [...users].filter((u) => [...$.get(selectedUsers), $.get(user)].includes(u)), true);
																				}
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_18 = root_8();
																				var node_29 = $.first_child(fragment_18);

																				$.component(node_29, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																					Avatar_Root_1($$anchor, {
																						class: 'border',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_19 = root();
																							var node_30 = $.first_child(fragment_19);

																							$.component(node_30, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																								Avatar_Image_1($$anchor, {
																									get src() {
																										return $.get(user).avatar;
																									},
																									alt: 'Image'
																								});
																							});

																							var node_31 = $.sibling(node_30, 2);

																							$.component(node_31, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																								Avatar_Fallback_1($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_6 = $.text();

																										$.template_effect(() => $.set_text(text_6, $.get(user).name[0]));
																										$.append($$anchor, text_6);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_19);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var div_3 = $.sibling(node_29, 2);
																				var p = $.child(div_3);
																				var text_7 = $.only_child(p, true);
																				var p_1 = $.sibling(p, 2);
																				var text_8 = $.only_child(p_1, true);

																				$.reset(div_3);

																				var node_32 = $.sibling(div_3, 2);

																				{
																					var consequent = ($$anchor) => {
																						CheckIcon($$anchor, { class: 'ms-auto flex size-4 text-primary' });
																					};

																					var d = $.derived(() => $.get(selectedUsers).includes($.get(user)));

																					$.if(node_32, ($$render) => {
																						if ($.get(d)) $$render(consequent);
																					});
																				}

																				$.template_effect(() => {
																					$.set_text(text_7, $.get(user).name);
																					$.set_text(text_8, $.get(user).email);
																				});

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

							var node_33 = $.sibling(node_22, 2);

							$.component(node_33, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									class: 'flex items-center border-t p-4 sm:justify-between',
									children: ($$anchor, $$slotProps) => {
										var fragment_22 = root();
										var node_34 = $.first_child(fragment_22);

										{
											var consequent_1 = ($$anchor) => {
												var div_4 = root_9();

												$.each(div_4, 21, () => $.get(selectedUsers), (user) => user.email, ($$anchor, user) => {
													var fragment_23 = $.comment();
													var node_35 = $.first_child(fragment_23);

													$.component(node_35, () => Avatar.Root, ($$anchor, Avatar_Root_2) => {
														Avatar_Root_2($$anchor, {
															class: 'inline-block border',
															children: ($$anchor, $$slotProps) => {
																var fragment_24 = root();
																var node_36 = $.first_child(fragment_24);

																$.component(node_36, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
																	Avatar_Image_2($$anchor, {
																		get src() {
																			return $.get(user).avatar;
																		}
																	});
																});

																var node_37 = $.sibling(node_36, 2);

																$.component(node_37, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
																	Avatar_Fallback_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_9 = $.text();

																			$.template_effect(() => $.set_text(text_9, $.get(user).name[0]));
																			$.append($$anchor, text_9);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_24);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_23);
												});

												$.reset(div_4);
												$.append($$anchor, div_4);
											};

											var alternate = ($$anchor) => {
												var p_2 = root_10();

												$.append($$anchor, p_2);
											};

											$.if(node_34, ($$render) => {
												if ($.get(selectedUsers).length > 0) $$render(consequent_1); else $$render(alternate, -1);
											});
										}

										var node_38 = $.sibling(node_34, 2);

										{
											let $0 = $.derived(() => $.get(selectedUsers).length < 2);

											Button(node_38, {
												get disabled() {
													return $.get($0);
												},
												onclick: () => $.set(open, false),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('Continue');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										}

										$.append($$anchor, fragment_22);
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

	$.append($$anchor, fragment);
	$.pop();
}