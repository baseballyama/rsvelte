import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Breadcrumb_ellipsis($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
		Breadcrumb_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
					Breadcrumb_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
								Breadcrumb_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
											Breadcrumb_Link($$anchor, {
												href: '/',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Home');

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

							var node_4 = $.sibling(node_2, 2);

							$.component(node_4, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
								Breadcrumb_Separator($$anchor, {});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
								Breadcrumb_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Breadcrumb.Ellipsis, ($$anchor, Breadcrumb_Ellipsis) => {
											Breadcrumb_Ellipsis($$anchor, {});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_5, 2);

							$.component(node_7, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator_1) => {
								Breadcrumb_Separator_1($$anchor, {});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_2) => {
								Breadcrumb_Item_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_9 = $.first_child(fragment_5);

										$.component(node_9, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link_1) => {
											Breadcrumb_Link_1($$anchor, {
												href: '/docs/components',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Components');

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

							var node_10 = $.sibling(node_8, 2);

							$.component(node_10, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator_2) => {
								Breadcrumb_Separator_2($$anchor, {});
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_3) => {
								Breadcrumb_Item_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = $.comment();
										var node_12 = $.first_child(fragment_6);

										$.component(node_12, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
											Breadcrumb_Page($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Breadcrumb');

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

							$.append($$anchor, fragment_2);
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
}