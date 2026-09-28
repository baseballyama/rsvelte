import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center gap-2"><!> <!> <!></div> <!> <div class="flex flex-col gap-4"><div class="text-sm font-medium">People with access</div> <!></div>`, 1);

export default function Share($$anchor, $$props) {
	$.push($$props, true);

	const permissions = [
		{ label: "Can edit", value: "edit" },
		{ label: "Can view", value: "view" }
	];

	let people = $.proxy([
		{
			name: "Olivia Martin",
			email: "m@example.com",
			avatar: "/avatars/03.png",
			permission: "edit"
		},

		{
			name: "Isabella Nguyen",
			email: "b@example.com",
			avatar: "/avatars/04.png",
			permission: "edit"
		},

		{
			name: "Sofia Davis",
			email: "p@example.com",
			avatar: "/avatars/05.png",
			permission: "edit"
		},

		{
			name: "Ethan Thompson",
			email: "e@example.com",
			avatar: "/avatars/01.png",
			permission: "edit"
		}
	]);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
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

										var text = $.text('Share this document');

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

										var text_1 = $.text('Anyone with the link can view this document.');

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
							var fragment_3 = root_2();
							var div = $.first_child(fragment_3);
							var node_5 = $.child(div);

							Label(node_5, {
								for: 'link',
								class: 'sr-only',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Link');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Input(node_6, {
								id: 'link',
								value: 'http://example.com/link/to/document',
								readonly: true,
								class: 'h-8'
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								size: 'sm',
								variant: 'outline',
								class: 'shadow-none',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Copy Link');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.reset(div);

							var node_8 = $.sibling(div, 2);

							Separator(node_8, { class: 'my-4' });

							var div_1 = $.sibling(node_8, 2);
							var node_9 = $.sibling($.child(div_1), 2);

							$.component(node_9, () => Item.Group, ($$anchor, Item_Group) => {
								Item_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_10 = $.first_child(fragment_4);

										$.each(node_10, 17, () => people, (person) => person.email, ($$anchor, person, $$index_1) => {
											var fragment_5 = $.comment();
											var node_11 = $.first_child(fragment_5);

											$.component(node_11, () => Item.Item, ($$anchor, Item_Item) => {
												Item_Item($$anchor, {
													class: 'px-0 py-2',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_1();
														var node_12 = $.first_child(fragment_6);

														$.component(node_12, () => Item.Media, ($$anchor, Item_Media) => {
															Item_Media($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = $.comment();
																	var node_13 = $.first_child(fragment_7);

																	$.component(node_13, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																		Avatar_Root($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_8 = root();
																				var node_14 = $.first_child(fragment_8);

																				$.component(node_14, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																					Avatar_Image($$anchor, {
																						get src() {
																							return $.get(person).avatar;
																						},
																						alt: 'Image'
																					});
																				});

																				var node_15 = $.sibling(node_14, 2);

																				$.component(node_15, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																					Avatar_Fallback($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_4 = $.text();

																							$.template_effect(($0) => $.set_text(text_4, $0), [() => $.get(person).name.charAt(0)]);
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

																	$.append($$anchor, fragment_7);
																},
																$$slots: { default: true }
															});
														});

														var node_16 = $.sibling(node_12, 2);

														$.component(node_16, () => Item.Content, ($$anchor, Item_Content) => {
															Item_Content($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = root();
																	var node_17 = $.first_child(fragment_10);

																	$.component(node_17, () => Item.Title, ($$anchor, Item_Title) => {
																		Item_Title($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_5 = $.text();

																				$.template_effect(() => $.set_text(text_5, $.get(person).name));
																				$.append($$anchor, text_5);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_18 = $.sibling(node_17, 2);

																	$.component(node_18, () => Item.Description, ($$anchor, Item_Description) => {
																		Item_Description($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_6 = $.text();

																				$.template_effect(() => $.set_text(text_6, $.get(person).email));
																				$.append($$anchor, text_6);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_10);
																},
																$$slots: { default: true }
															});
														});

														var node_19 = $.sibling(node_16, 2);

														$.component(node_19, () => Item.Actions, ($$anchor, Item_Actions) => {
															Item_Actions($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_13 = $.comment();
																	var node_20 = $.first_child(fragment_13);

																	$.component(node_20, () => Select.Root, ($$anchor, Select_Root) => {
																		Select_Root($$anchor, {
																			type: 'single',
																			get value() {
																				return $.get(person).permission;
																			},

																			set value($$value) {
																				($.get(person).permission = $$value);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_14 = root();
																				var node_21 = $.first_child(fragment_14);

																				$.component(node_21, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																					Select_Trigger($$anchor, {
																						class: 'ms-auto pe-2',
																						size: 'sm',
																						'aria-label': 'Edit',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_7 = $.text();

																							$.template_effect(($0) => $.set_text(text_7, $0), [
																								() => permissions.find((p) => p.value === $.get(person).permission)?.label ?? "Select"
																							]);

																							$.append($$anchor, text_7);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_22 = $.sibling(node_21, 2);

																				$.component(node_22, () => Select.Content, ($$anchor, Select_Content) => {
																					Select_Content($$anchor, {
																						align: 'end',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_16 = $.comment();
																							var node_23 = $.first_child(fragment_16);

																							$.each(node_23, 17, () => permissions, (permission) => permission.value, ($$anchor, permission) => {
																								var fragment_17 = $.comment();
																								var node_24 = $.first_child(fragment_17);

																								$.component(node_24, () => Select.Item, ($$anchor, Select_Item) => {
																									Select_Item($$anchor, {
																										get value() {
																											return $.get(permission).value;
																										},

																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_8 = $.text();

																											$.template_effect(() => $.set_text(text_8, $.get(permission).label));
																											$.append($$anchor, text_8);
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

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_1);
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