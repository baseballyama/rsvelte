import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Item_muted_group($$anchor) {
	Example($$anchor, {
		title: 'Muted - ItemGroup',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Item.Group, ($$anchor, Item_Group) => {
				Item_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Item.Root, ($$anchor, Item_Root) => {
							Item_Root($$anchor, {
								variant: 'muted',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Item.Content, ($$anchor, Item_Content) => {
										Item_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Item.Title, ($$anchor, Item_Title) => {
													Item_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Item 1');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => Item.Description, ($$anchor, Item_Description) => {
													Item_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('First item in muted group.');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_2, 2);

									$.component(node_5, () => Item.Actions, ($$anchor, Item_Actions) => {
										Item_Actions($$anchor, {
											children: ($$anchor, $$slotProps) => {
												Button($$anchor, {
													variant: 'outline',
													size: 'sm',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Action');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => Item.Root, ($$anchor, Item_Root_1) => {
							Item_Root_1($$anchor, {
								variant: 'muted',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_7 = $.first_child(fragment_6);

									$.component(node_7, () => Item.Content, ($$anchor, Item_Content_1) => {
										Item_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root();
												var node_8 = $.first_child(fragment_7);

												$.component(node_8, () => Item.Title, ($$anchor, Item_Title_1) => {
													Item_Title_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Item 2');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Item.Description, ($$anchor, Item_Description_1) => {
													Item_Description_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Second item in muted group.');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_7, 2);

									$.component(node_10, () => Item.Actions, ($$anchor, Item_Actions_1) => {
										Item_Actions_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												Button($$anchor, {
													variant: 'outline',
													size: 'sm',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Action');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_6, 2);

						$.component(node_11, () => Item.Root, ($$anchor, Item_Root_2) => {
							Item_Root_2($$anchor, {
								variant: 'muted',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root();
									var node_12 = $.first_child(fragment_9);

									$.component(node_12, () => Item.Content, ($$anchor, Item_Content_2) => {
										Item_Content_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root();
												var node_13 = $.first_child(fragment_10);

												$.component(node_13, () => Item.Title, ($$anchor, Item_Title_2) => {
													Item_Title_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Item 3');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => Item.Description, ($$anchor, Item_Description_2) => {
													Item_Description_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Third item in muted group.');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_12, 2);

									$.component(node_15, () => Item.Actions, ($$anchor, Item_Actions_2) => {
										Item_Actions_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												Button($$anchor, {
													variant: 'outline',
													size: 'sm',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text('Action');

														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
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