import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Item_variants($$anchor) {
	const variants = [
		{ title: "Default" },
		{ title: "Outline", variant: "outline" },
		{ title: "Muted", variant: "muted" },
		{ title: "Small", size: "sm" },
		{ title: "Outline - Small", variant: "outline", size: "sm" },
		{ title: "Muted - Small", variant: "muted", size: "sm" },
		{ title: "Extra Small", size: "xs" },
		{
			title: "Outline - Extra Small",
			variant: "outline",
			size: "xs"
		},
		{ title: "Muted - Extra Small", variant: "muted", size: "xs" }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => variants, ({ title, variant, size }) => `${title}-${variant}-${size}`, ($$anchor, $$item) => {
		let title = () => $.get($$item).title;
		let variant = () => $.get($$item).variant;
		let size = () => $.get($$item).size;

		Example($$anchor, {
			get title() {
				return title();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var node_1 = $.first_child(fragment_2);

				$.component(node_1, () => Item.Root, ($$anchor, Item_Root) => {
					Item_Root($$anchor, {
						get variant() {
							return variant();
						},

						get size() {
							return size();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Item.Content, ($$anchor, Item_Content) => {
								Item_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_3 = $.first_child(fragment_4);

										$.component(node_3, () => Item.Title, ($$anchor, Item_Title) => {
											Item_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Title Only');

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

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Item.Root, ($$anchor, Item_Root_1) => {
					Item_Root_1($$anchor, {
						get variant() {
							return variant();
						},

						get size() {
							return size();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_5 = $.first_child(fragment_5);

							$.component(node_5, () => Item.Content, ($$anchor, Item_Content_1) => {
								Item_Content_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_6 = $.first_child(fragment_6);

										$.component(node_6, () => Item.Title, ($$anchor, Item_Title_1) => {
											Item_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Title + Button');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_5, 2);

							$.component(node_7, () => Item.Actions, ($$anchor, Item_Actions) => {
								Item_Actions($$anchor, {
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => size() === "xs" || size() === "sm" ? "sm" : undefined);

											Button($$anchor, {
												variant: 'outline',
												get size() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Action');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_4, 2);

				$.component(node_8, () => Item.Root, ($$anchor, Item_Root_2) => {
					Item_Root_2($$anchor, {
						get variant() {
							return variant();
						},

						get size() {
							return size();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_9 = $.first_child(fragment_8);

							$.component(node_9, () => Item.Content, ($$anchor, Item_Content_2) => {
								Item_Content_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root();
										var node_10 = $.first_child(fragment_9);

										$.component(node_10, () => Item.Title, ($$anchor, Item_Title_2) => {
											Item_Title_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Title + Description');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => Item.Description, ($$anchor, Item_Description) => {
											Item_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('This is a description that provides additional context.');

													$.append($$anchor, text_4);
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

				var node_12 = $.sibling(node_8, 2);

				$.component(node_12, () => Item.Root, ($$anchor, Item_Root_3) => {
					Item_Root_3($$anchor, {
						get variant() {
							return variant();
						},

						get size() {
							return size();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root();
							var node_13 = $.first_child(fragment_10);

							$.component(node_13, () => Item.Content, ($$anchor, Item_Content_3) => {
								Item_Content_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root();
										var node_14 = $.first_child(fragment_11);

										$.component(node_14, () => Item.Title, ($$anchor, Item_Title_3) => {
											Item_Title_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Title + Description + Button');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => Item.Description, ($$anchor, Item_Description_1) => {
											Item_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('This item includes a title, description, and action button.');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							var node_16 = $.sibling(node_13, 2);

							$.component(node_16, () => Item.Actions, ($$anchor, Item_Actions_1) => {
								Item_Actions_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => size() === "xs" || size() === "sm" ? "sm" : undefined);

											Button($$anchor, {
												variant: 'outline',
												get size() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Action');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				var node_17 = $.sibling(node_12, 2);

				$.component(node_17, () => Item.Root, ($$anchor, Item_Root_4) => {
					Item_Root_4($$anchor, {
						get variant() {
							return variant();
						},

						get size() {
							return size();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root();
							var node_18 = $.first_child(fragment_13);

							$.component(node_18, () => Item.Media, ($$anchor, Item_Media) => {
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

							var node_19 = $.sibling(node_18, 2);

							$.component(node_19, () => Item.Content, ($$anchor, Item_Content_4) => {
								Item_Content_4($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_15 = $.comment();
										var node_20 = $.first_child(fragment_15);

										$.component(node_20, () => Item.Title, ($$anchor, Item_Title_4) => {
											Item_Title_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Media + Title');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_15);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				});

				var node_21 = $.sibling(node_17, 2);

				$.component(node_21, () => Item.Root, ($$anchor, Item_Root_5) => {
					Item_Root_5($$anchor, {
						get variant() {
							return variant();
						},

						get size() {
							return size();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_1();
							var node_22 = $.first_child(fragment_16);

							$.component(node_22, () => Item.Media, ($$anchor, Item_Media_1) => {
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

							var node_23 = $.sibling(node_22, 2);

							$.component(node_23, () => Item.Content, ($$anchor, Item_Content_5) => {
								Item_Content_5($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_18 = $.comment();
										var node_24 = $.first_child(fragment_18);

										$.component(node_24, () => Item.Title, ($$anchor, Item_Title_5) => {
											Item_Title_5($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Media + Title + Button');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_18);
									},
									$$slots: { default: true }
								});
							});

							var node_25 = $.sibling(node_23, 2);

							$.component(node_25, () => Item.Actions, ($$anchor, Item_Actions_2) => {
								Item_Actions_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											size: 'sm',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('Action');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});
				});

				var node_26 = $.sibling(node_21, 2);

				$.component(node_26, () => Item.Root, ($$anchor, Item_Root_6) => {
					Item_Root_6($$anchor, {
						get variant() {
							return variant();
						},

						get size() {
							return size();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_20 = root();
							var node_27 = $.first_child(fragment_20);

							$.component(node_27, () => Item.Media, ($$anchor, Item_Media_2) => {
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

							var node_28 = $.sibling(node_27, 2);

							$.component(node_28, () => Item.Content, ($$anchor, Item_Content_6) => {
								Item_Content_6($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_22 = root();
										var node_29 = $.first_child(fragment_22);

										$.component(node_29, () => Item.Title, ($$anchor, Item_Title_6) => {
											Item_Title_6($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text('Media + Title + Description');

													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});
										});

										var node_30 = $.sibling(node_29, 2);

										$.component(node_30, () => Item.Description, ($$anchor, Item_Description_2) => {
											Item_Description_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_12 = $.text('This item includes media, title, and description.');

													$.append($$anchor, text_12);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_22);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_20);
						},
						$$slots: { default: true }
					});
				});

				var node_31 = $.sibling(node_26, 2);

				$.component(node_31, () => Item.Root, ($$anchor, Item_Root_7) => {
					Item_Root_7($$anchor, {
						get variant() {
							return variant();
						},

						get size() {
							return size();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_23 = root_1();
							var node_32 = $.first_child(fragment_23);

							$.component(node_32, () => Item.Media, ($$anchor, Item_Media_3) => {
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

							var node_33 = $.sibling(node_32, 2);

							$.component(node_33, () => Item.Content, ($$anchor, Item_Content_7) => {
								Item_Content_7($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_25 = root();
										var node_34 = $.first_child(fragment_25);

										$.component(node_34, () => Item.Title, ($$anchor, Item_Title_7) => {
											Item_Title_7($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_13 = $.text('Media + Title + Description + Button');

													$.append($$anchor, text_13);
												},
												$$slots: { default: true }
											});
										});

										var node_35 = $.sibling(node_34, 2);

										$.component(node_35, () => Item.Description, ($$anchor, Item_Description_3) => {
											Item_Description_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_14 = $.text('Complete item with all components: media, title, description, and button.');

													$.append($$anchor, text_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_25);
									},
									$$slots: { default: true }
								});
							});

							var node_36 = $.sibling(node_33, 2);

							$.component(node_36, () => Item.Actions, ($$anchor, Item_Actions_3) => {
								Item_Actions_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											size: 'sm',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_15 = $.text('Action');

												$.append($$anchor, text_15);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_23);
						},
						$$slots: { default: true }
					});
				});

				var node_37 = $.sibling(node_31, 2);

				$.component(node_37, () => Item.Root, ($$anchor, Item_Root_8) => {
					Item_Root_8($$anchor, {
						get variant() {
							return variant();
						},

						get size() {
							return size();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_27 = root();
							var node_38 = $.first_child(fragment_27);

							$.component(node_38, () => Item.Content, ($$anchor, Item_Content_8) => {
								Item_Content_8($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_28 = root();
										var node_39 = $.first_child(fragment_28);

										$.component(node_39, () => Item.Title, ($$anchor, Item_Title_8) => {
											Item_Title_8($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text('Multiple Actions');

													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										});

										var node_40 = $.sibling(node_39, 2);

										$.component(node_40, () => Item.Description, ($$anchor, Item_Description_4) => {
											Item_Description_4($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('Item with multiple action buttons in the actions area.');

													$.append($$anchor, text_17);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_28);
									},
									$$slots: { default: true }
								});
							});

							var node_41 = $.sibling(node_38, 2);

							$.component(node_41, () => Item.Actions, ($$anchor, Item_Actions_4) => {
								Item_Actions_4($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_29 = root();
										var node_42 = $.first_child(fragment_29);

										Button(node_42, {
											variant: 'outline',
											size: 'sm',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_18 = $.text('Cancel');

												$.append($$anchor, text_18);
											},
											$$slots: { default: true }
										});

										var node_43 = $.sibling(node_42, 2);

										Button(node_43, {
											size: 'sm',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_19 = $.text('Confirm');

												$.append($$anchor, text_19);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_29);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_27);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}