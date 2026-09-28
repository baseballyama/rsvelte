import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<span class="text-sm font-medium">Design System</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span class="text-sm font-medium">Marketing</span>`);
var root_3 = $.from_html(`<span class="text-sm font-medium">Engineering</span>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Item_header($$anchor) {
	Example($$anchor, {
		title: 'ItemHeader',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
				Item_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Item.Header, ($$anchor, Item_Header) => {
							Item_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span = root();

									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Item.Content, ($$anchor, Item_Content) => {
							Item_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Component Library');

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

												var text_1 = $.text('A comprehensive collection of reusable UI components for building consistent interfaces.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node, 2);

			$.component(node_5, () => Item.Root, ($$anchor, Item_Root_1) => {
				Item_Root_1($$anchor, {
					variant: 'outline',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var node_6 = $.first_child(fragment_4);

						$.component(node_6, () => Item.Header, ($$anchor, Item_Header_1) => {
							Item_Header_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span_1 = root_2();

									$.append($$anchor, span_1);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Item.Content, ($$anchor, Item_Content_1) => {
							Item_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_8 = $.first_child(fragment_5);

									$.component(node_8, () => Item.Title, ($$anchor, Item_Title_1) => {
										Item_Title_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Campaign Analytics');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => Item.Description, ($$anchor, Item_Description_1) => {
										Item_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Track performance metrics and engagement rates across all marketing channels.');

												$.append($$anchor, text_3);
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

			var node_10 = $.sibling(node_5, 2);

			$.component(node_10, () => Item.Root, ($$anchor, Item_Root_2) => {
				Item_Root_2($$anchor, {
					variant: 'muted',
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_1();
						var node_11 = $.first_child(fragment_6);

						$.component(node_11, () => Item.Header, ($$anchor, Item_Header_2) => {
							Item_Header_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span_2 = root_3();

									$.append($$anchor, span_2);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_11, 2);

						$.component(node_12, () => Item.Content, ($$anchor, Item_Content_2) => {
							Item_Content_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_13 = $.first_child(fragment_7);

									$.component(node_13, () => Item.Title, ($$anchor, Item_Title_2) => {
										Item_Title_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('API Documentation');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Item.Description, ($$anchor, Item_Description_2) => {
										Item_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Complete reference guide for all available endpoints and authentication methods.');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}