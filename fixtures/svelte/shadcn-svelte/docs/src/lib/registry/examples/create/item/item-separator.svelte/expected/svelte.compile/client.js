import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Item_separator($$anchor) {
	Example($$anchor, {
		title: 'ItemSeparator',
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
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Item.Media, ($$anchor, Item_Media) => {
										Item_Media($$anchor, {
											variant: 'icon',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'InboxIcon',
													tabler: 'IconArchive',
													hugeicons: 'Archive02Icon',
													phosphor: 'ArchiveIcon',
													remixicon: 'RiArchiveLine'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Item.Content, ($$anchor, Item_Content) => {
										Item_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Item.Title, ($$anchor, Item_Title) => {
													Item_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Inbox');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Item.Description, ($$anchor, Item_Description) => {
													Item_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('View all incoming messages.');

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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => Item.Separator, ($$anchor, Item_Separator) => {
							Item_Separator($$anchor, {});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Item.Root, ($$anchor, Item_Root_1) => {
							Item_Root_1($$anchor, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root();
									var node_8 = $.first_child(fragment_6);

									$.component(node_8, () => Item.Media, ($$anchor, Item_Media_1) => {
										Item_Media_1($$anchor, {
											variant: 'icon',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'InboxIcon',
													tabler: 'IconArchive',
													hugeicons: 'Archive02Icon',
													phosphor: 'ArchiveIcon',
													remixicon: 'RiArchiveLine'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => Item.Content, ($$anchor, Item_Content_1) => {
										Item_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_10 = $.first_child(fragment_8);

												$.component(node_10, () => Item.Title, ($$anchor, Item_Title_1) => {
													Item_Title_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Sent');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => Item.Description, ($$anchor, Item_Description_1) => {
													Item_Description_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('View all sent messages.');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_7, 2);

						$.component(node_12, () => Item.Separator, ($$anchor, Item_Separator_1) => {
							Item_Separator_1($$anchor, {});
						});

						var node_13 = $.sibling(node_12, 2);

						$.component(node_13, () => Item.Root, ($$anchor, Item_Root_2) => {
							Item_Root_2($$anchor, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root();
									var node_14 = $.first_child(fragment_9);

									$.component(node_14, () => Item.Media, ($$anchor, Item_Media_2) => {
										Item_Media_2($$anchor, {
											variant: 'icon',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'InboxIcon',
													tabler: 'IconArchive',
													hugeicons: 'Archive02Icon',
													phosphor: 'ArchiveIcon',
													remixicon: 'RiArchiveLine'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Item.Content, ($$anchor, Item_Content_2) => {
										Item_Content_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = root();
												var node_16 = $.first_child(fragment_11);

												$.component(node_16, () => Item.Title, ($$anchor, Item_Title_2) => {
													Item_Title_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Drafts');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_17 = $.sibling(node_16, 2);

												$.component(node_17, () => Item.Description, ($$anchor, Item_Description_2) => {
													Item_Description_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('View all draft messages.');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_18 = $.sibling(node_13, 2);

						$.component(node_18, () => Item.Separator, ($$anchor, Item_Separator_2) => {
							Item_Separator_2($$anchor, {});
						});

						var node_19 = $.sibling(node_18, 2);

						$.component(node_19, () => Item.Root, ($$anchor, Item_Root_3) => {
							Item_Root_3($$anchor, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root();
									var node_20 = $.first_child(fragment_12);

									$.component(node_20, () => Item.Media, ($$anchor, Item_Media_3) => {
										Item_Media_3($$anchor, {
											variant: 'icon',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'InboxIcon',
													tabler: 'IconArchive',
													hugeicons: 'Archive02Icon',
													phosphor: 'ArchiveIcon',
													remixicon: 'RiArchiveLine'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_21 = $.sibling(node_20, 2);

									$.component(node_21, () => Item.Content, ($$anchor, Item_Content_3) => {
										Item_Content_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root();
												var node_22 = $.first_child(fragment_14);

												$.component(node_22, () => Item.Title, ($$anchor, Item_Title_3) => {
													Item_Title_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Archive');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_23 = $.sibling(node_22, 2);

												$.component(node_23, () => Item.Description, ($$anchor, Item_Description_3) => {
													Item_Description_3($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('View archived messages.');

															$.append($$anchor, text_7);
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