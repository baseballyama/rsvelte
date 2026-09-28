import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Plus from "@lucide/svelte/icons/plus";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex w-full max-w-md flex-col gap-6"><!></div>`);

export default function Item_group_demo($$anchor) {
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

	$.component(node, () => Item.Group, ($$anchor, Item_Group) => {
		Item_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.each(node_1, 19, () => people, (person) => person.username, ($$anchor, person, index) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Item.Root, ($$anchor, Item_Root) => {
						Item_Root($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Item.Media, ($$anchor, Item_Media) => {
									Item_Media($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Avatar.Root, ($$anchor, Avatar_Root) => {
												Avatar_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root();
														var node_5 = $.first_child(fragment_4);

														$.component(node_5, () => Avatar.Image, ($$anchor, Avatar_Image) => {
															Avatar_Image($$anchor, {
																get src() {
																	return $.get(person).avatar;
																},
																class: 'grayscale'
															});
														});

														var node_6 = $.sibling(node_5, 2);

														$.component(node_6, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
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

								var node_7 = $.sibling(node_3, 2);

								$.component(node_7, () => Item.Content, ($$anchor, Item_Content) => {
									Item_Content($$anchor, {
										class: 'gap-1',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_8 = $.first_child(fragment_6);

											$.component(node_8, () => Item.Title, ($$anchor, Item_Title) => {
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

											var node_9 = $.sibling(node_8, 2);

											$.component(node_9, () => Item.Description, ($$anchor, Item_Description) => {
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

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								var node_10 = $.sibling(node_7, 2);

								$.component(node_10, () => Item.Actions, ($$anchor, Item_Actions) => {
									Item_Actions($$anchor, {
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												variant: 'ghost',
												size: 'icon',
												class: 'rounded-full',
												children: ($$anchor, $$slotProps) => {
													Plus($$anchor, {});
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					var node_11 = $.sibling(node_2, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_11 = $.comment();
							var node_12 = $.first_child(fragment_11);

							$.component(node_12, () => Item.Separator, ($$anchor, Item_Separator) => {
								Item_Separator($$anchor, {});
							});

							$.append($$anchor, fragment_11);
						};

						$.if(node_11, ($$render) => {
							if ($.get(index) !== people.length - 1) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_1);
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}