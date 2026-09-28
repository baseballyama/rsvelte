import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span class="text-sm text-muted-foreground">Last updated 2 hours ago</span>`);
var root_2 = $.from_html(`<span class="text-sm text-muted-foreground">Created by Sarah Chen</span>`);
var root_3 = $.from_html(`<span class="text-sm text-muted-foreground">12 comments</span>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Item_footer($$anchor) {
	Example($$anchor, {
		title: 'ItemFooter',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node = $.first_child(fragment_1);

			$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
				Item_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Item.Content, ($$anchor, Item_Content) => {
							Item_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Quarterly Report Q4 2024');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Item.Description, ($$anchor, Item_Description) => {
										Item_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Financial overview including revenue, expenses, and growth metrics for the fourth quarter.');

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

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Item.Footer, ($$anchor, Item_Footer) => {
							Item_Footer($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span = root_1();

									$.append($$anchor, span);
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
						var fragment_4 = root();
						var node_6 = $.first_child(fragment_4);

						$.component(node_6, () => Item.Content, ($$anchor, Item_Content_1) => {
							Item_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_7 = $.first_child(fragment_5);

									$.component(node_7, () => Item.Title, ($$anchor, Item_Title_1) => {
										Item_Title_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('User Research Findings');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => Item.Description, ($$anchor, Item_Description_1) => {
										Item_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Insights from interviews and surveys conducted with 50+ users across different demographics.');

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

						var node_9 = $.sibling(node_6, 2);

						$.component(node_9, () => Item.Footer, ($$anchor, Item_Footer_1) => {
							Item_Footer_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span_1 = root_2();

									$.append($$anchor, span_1);
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
						var fragment_6 = root();
						var node_11 = $.first_child(fragment_6);

						$.component(node_11, () => Item.Content, ($$anchor, Item_Content_2) => {
							Item_Content_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root();
									var node_12 = $.first_child(fragment_7);

									$.component(node_12, () => Item.Title, ($$anchor, Item_Title_2) => {
										Item_Title_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Product Roadmap');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.component(node_13, () => Item.Description, ($$anchor, Item_Description_2) => {
										Item_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Planned features and improvements scheduled for the next three months.');

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

						var node_14 = $.sibling(node_11, 2);

						$.component(node_14, () => Item.Footer, ($$anchor, Item_Footer_2) => {
							Item_Footer_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var span_2 = root_3();

									$.append($$anchor, span_2);
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