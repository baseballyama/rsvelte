import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`Select <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex min-h-64 w-full max-w-md flex-col items-center gap-6"><!></div>`);

export default function Item_dropdown_demo($$anchor) {
	const people = [
		{
			username: "shadcn",
			avatar: "https://github.com/shadcn.png",
			email: "shadcn@vercel.com"
		},

		{
			username: "maxleiter",
			avatar: "https://github.com/maxleiter.png",
			email: "maxleiter@vercel.com"
		},

		{
			username: "evilrabbit",
			avatar: "https://github.com/evilrabbit.png",
			email: "evilrabbit@vercel.com"
		}
	];

	var div = root_2();
	var node = $.child(div);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							size: 'sm',
							class: 'w-fit',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_2 = root();
								var node_2 = $.sibling($.first_child(fragment_2));

								ChevronDown(node_2, {});
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						class: 'w-72 [--radius:0.65rem]',
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, () => people, (person) => person.username, ($$anchor, person) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
									DropdownMenu_Item($$anchor, {
										class: 'p-0',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_6 = $.first_child(fragment_5);

											$.component(node_6, () => Item.Root, ($$anchor, Item_Root) => {
												Item_Root($$anchor, {
													size: 'sm',
													class: 'w-full p-2',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root_1();
														var node_7 = $.first_child(fragment_6);

														$.component(node_7, () => Item.Media, ($$anchor, Item_Media) => {
															Item_Media($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = $.comment();
																	var node_8 = $.first_child(fragment_7);

																	$.component(node_8, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																		Avatar_Root($$anchor, {
																			class: 'size-8',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_8 = root_1();
																				var node_9 = $.first_child(fragment_8);

																				$.component(node_9, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																					Avatar_Image($$anchor, {
																						get src() {
																							return $.get(person).avatar;
																						},
																						class: 'grayscale'
																					});
																				});

																				var node_10 = $.sibling(node_9, 2);

																				$.component(node_10, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																					Avatar_Fallback($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text = $.text();

																							$.template_effect(($0) => $.set_text(text, $0), [() => $.get(person).username.charAt(0)]);
																							$.append($$anchor, text);
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

														var node_11 = $.sibling(node_7, 2);

														$.component(node_11, () => Item.Content, ($$anchor, Item_Content) => {
															Item_Content($$anchor, {
																class: 'gap-0.5',
																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = root_1();
																	var node_12 = $.first_child(fragment_10);

																	$.component(node_12, () => Item.Title, ($$anchor, Item_Title) => {
																		Item_Title($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text();

																				$.template_effect(() => $.set_text(text_1, $.get(person).username));
																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_13 = $.sibling(node_12, 2);

																	$.component(node_13, () => Item.Description, ($$anchor, Item_Description) => {
																		Item_Description($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text();

																				$.template_effect(() => $.set_text(text_2, $.get(person).email));
																				$.append($$anchor, text_2);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_10);
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
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}