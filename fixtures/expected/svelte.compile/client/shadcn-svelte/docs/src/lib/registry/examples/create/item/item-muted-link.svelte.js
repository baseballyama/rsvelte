import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<a><!></a>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<a><!> <!></a>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Item_muted_link($$anchor) {
	Example($$anchor, {
		title: 'Muted - asChild',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Item.Group, ($$anchor, Item_Group) => {
				Item_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var a = root();

								$.attribute_effect(a, () => ({ href: '#/', ...props() }));

								var node_2 = $.child(a);

								$.component(node_2, () => Item.Content, ($$anchor, Item_Content) => {
									Item_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_3 = $.first_child(fragment_3);

											$.component(node_3, () => Item.Title, ($$anchor, Item_Title) => {
												Item_Title($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Title Only (Link)');

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

								$.reset(a);
								$.append($$anchor, a);
							};

							$.component(node_1, () => Item.Root, ($$anchor, Item_Root) => {
								Item_Root($$anchor, { variant: 'muted', child, $$slots: { child: true } });
							});
						}

						var node_4 = $.sibling(node_1, 2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var a_1 = root();

								$.attribute_effect(a_1, () => ({ href: '#/', ...props() }));

								var node_5 = $.child(a_1);

								$.component(node_5, () => Item.Content, ($$anchor, Item_Content_1) => {
									Item_Content_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_1();
											var node_6 = $.first_child(fragment_4);

											$.component(node_6, () => Item.Title, ($$anchor, Item_Title_1) => {
												Item_Title_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Title + Description (Link)');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_6, 2);

											$.component(node_7, () => Item.Description, ($$anchor, Item_Description) => {
												Item_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Clickable item with title and description.');

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

								$.reset(a_1);
								$.append($$anchor, a_1);
							};

							$.component(node_4, () => Item.Root, ($$anchor, Item_Root_1) => {
								Item_Root_1($$anchor, { variant: 'muted', child, $$slots: { child: true } });
							});
						}

						var node_8 = $.sibling(node_4, 2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var a_2 = root_2();

								$.attribute_effect(a_2, () => ({ href: '#/', ...props() }));

								var node_9 = $.child(a_2);

								$.component(node_9, () => Item.Media, ($$anchor, Item_Media) => {
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

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => Item.Content, ($$anchor, Item_Content_2) => {
									Item_Content_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = $.comment();
											var node_11 = $.first_child(fragment_6);

											$.component(node_11, () => Item.Title, ($$anchor, Item_Title_2) => {
												Item_Title_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Media + Title (Link)');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								$.reset(a_2);
								$.append($$anchor, a_2);
							};

							$.component(node_8, () => Item.Root, ($$anchor, Item_Root_2) => {
								Item_Root_2($$anchor, { variant: 'muted', child, $$slots: { child: true } });
							});
						}

						var node_12 = $.sibling(node_8, 2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var a_3 = root_2();

								$.attribute_effect(a_3, () => ({ href: '#/', ...props() }));

								var node_13 = $.child(a_3);

								$.component(node_13, () => Item.Media, ($$anchor, Item_Media_1) => {
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

								var node_14 = $.sibling(node_13, 2);

								$.component(node_14, () => Item.Content, ($$anchor, Item_Content_3) => {
									Item_Content_3($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root_1();
											var node_15 = $.first_child(fragment_8);

											$.component(node_15, () => Item.Title, ($$anchor, Item_Title_3) => {
												Item_Title_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Media + Title + Description (Link)');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											var node_16 = $.sibling(node_15, 2);

											$.component(node_16, () => Item.Description, ($$anchor, Item_Description_1) => {
												Item_Description_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Complete link item with media, title, and description.');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.reset(a_3);
								$.append($$anchor, a_3);
							};

							$.component(node_12, () => Item.Root, ($$anchor, Item_Root_3) => {
								Item_Root_3($$anchor, { variant: 'muted', child, $$slots: { child: true } });
							});
						}

						var node_17 = $.sibling(node_12, 2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var a_4 = root_2();

								$.attribute_effect(a_4, () => ({ href: '#/', ...props() }));

								var node_18 = $.child(a_4);

								$.component(node_18, () => Item.Content, ($$anchor, Item_Content_4) => {
									Item_Content_4($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = root_1();
											var node_19 = $.first_child(fragment_9);

											$.component(node_19, () => Item.Title, ($$anchor, Item_Title_4) => {
												Item_Title_4($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_6 = $.text('With Actions (Link)');

														$.append($$anchor, text_6);
													},
													$$slots: { default: true }
												});
											});

											var node_20 = $.sibling(node_19, 2);

											$.component(node_20, () => Item.Description, ($$anchor, Item_Description_2) => {
												Item_Description_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_7 = $.text('Link item that also has action buttons.');

														$.append($$anchor, text_7);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});

								var node_21 = $.sibling(node_18, 2);

								$.component(node_21, () => Item.Actions, ($$anchor, Item_Actions) => {
									Item_Actions($$anchor, {
										children: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												variant: 'outline',
												size: 'sm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Share');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});
								});

								$.reset(a_4);
								$.append($$anchor, a_4);
							};

							$.component(node_17, () => Item.Root, ($$anchor, Item_Root_4) => {
								Item_Root_4($$anchor, { variant: 'muted', child, $$slots: { child: true } });
							});
						}

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