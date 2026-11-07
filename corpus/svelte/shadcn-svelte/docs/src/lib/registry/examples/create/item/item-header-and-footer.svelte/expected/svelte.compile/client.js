import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<span class="text-sm font-medium">Team Project</span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<span class="text-sm text-muted-foreground">Updated 5 minutes ago</span>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<span class="text-sm font-medium">Client Work</span>`);
var root_5 = $.from_html(`<span class="text-sm text-muted-foreground">Status: In Progress</span>`);
var root_6 = $.from_html(`<span class="text-sm font-medium">Documentation</span>`);
var root_7 = $.from_html(`<span class="text-sm text-muted-foreground">Category: Technical • 3 attachments</span>`);

export default function Item_header_and_footer($$anchor) {
	Example($$anchor, {
		title: 'ItemHeader + ItemFooter',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
				Item_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
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

												var text = $.text('Website Redesign');

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

												var text_1 = $.text('Complete overhaul of the company website with modern design principles and improved user\n				experience.');

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

						var node_5 = $.sibling(node_2, 2);

						$.component(node_5, () => Item.Footer, ($$anchor, Item_Footer) => {
							Item_Footer($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span_1 = root_2();

									$.append($$anchor, span_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node, 2);

			$.component(node_6, () => Item.Root, ($$anchor, Item_Root_1) => {
				Item_Root_1($$anchor, {
					variant: 'outline',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_3();
						var node_7 = $.first_child(fragment_4);

						$.component(node_7, () => Item.Header, ($$anchor, Item_Header_1) => {
							Item_Header_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span_2 = root_4();

									$.append($$anchor, span_2);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Item.Content, ($$anchor, Item_Content_1) => {
							Item_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_9 = $.first_child(fragment_5);

									$.component(node_9, () => Item.Title, ($$anchor, Item_Title_1) => {
										Item_Title_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Mobile App Development');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Item.Description, ($$anchor, Item_Description_1) => {
										Item_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Building a cross-platform mobile application for iOS and Android with React Native.');

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

						var node_11 = $.sibling(node_8, 2);

						$.component(node_11, () => Item.Footer, ($$anchor, Item_Footer_1) => {
							Item_Footer_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span_3 = root_5();

									$.append($$anchor, span_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node_6, 2);

			$.component(node_12, () => Item.Root, ($$anchor, Item_Root_2) => {
				Item_Root_2($$anchor, {
					variant: 'muted',
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_3();
						var node_13 = $.first_child(fragment_6);

						$.component(node_13, () => Item.Header, ($$anchor, Item_Header_2) => {
							Item_Header_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span_4 = root_6();

									$.append($$anchor, span_4);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_13, 2);

						$.component(node_14, () => Item.Content, ($$anchor, Item_Content_2) => {
							Item_Content_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_15 = $.first_child(fragment_7);

									$.component(node_15, () => Item.Title, ($$anchor, Item_Title_2) => {
										Item_Title_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('API Integration Guide');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => Item.Description, ($$anchor, Item_Description_2) => {
										Item_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Step-by-step instructions for integrating third-party APIs with authentication and error\n				handling.');

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

						var node_17 = $.sibling(node_14, 2);

						$.component(node_17, () => Item.Footer, ($$anchor, Item_Footer_2) => {
							Item_Footer_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span_5 = root_7();

									$.append($$anchor, span_5);
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