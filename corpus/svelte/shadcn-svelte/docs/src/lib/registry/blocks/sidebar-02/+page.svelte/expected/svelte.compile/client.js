import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import AppSidebar from "./components/app-sidebar.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="aspect-video h-12 w-full rounded-lg bg-muted/50"></div>`);
var root_2 = $.from_html(`<header class="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4"><!> <!> <!></header> <div class="flex flex-1 flex-col gap-4 p-4"></div>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				AppSidebar(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var header = $.first_child(fragment_2);
							var node_3 = $.child(header);

							$.component(node_3, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
								Sidebar_Trigger($$anchor, { class: '-ms-1' });
							});

							var node_4 = $.sibling(node_3, 2);

							Separator(node_4, { orientation: 'vertical', class: 'me-2 h-4' });

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
								Breadcrumb_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
											Breadcrumb_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_7 = $.first_child(fragment_4);

													$.component(node_7, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
														Breadcrumb_Item($$anchor, {
															class: 'hidden md:block',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_8 = $.first_child(fragment_5);

																$.component(node_8, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
																	Breadcrumb_Link($$anchor, {
																		href: '##',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text('Build Your Application');

																			$.append($$anchor, text);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_7, 2);

													$.component(node_9, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
														Breadcrumb_Separator($$anchor, { class: 'hidden md:block' });
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
														Breadcrumb_Item_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = $.comment();
																var node_11 = $.first_child(fragment_6);

																$.component(node_11, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
																	Breadcrumb_Page($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('Data Fetching');

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

							$.reset(header);

							var div = $.sibling(header, 2);

							$.each(div, 20, () => Array.from({ length: 24 }), $.index, ($$anchor, _) => {
								var div_1 = root_1();

								$.append($$anchor, div_1);
							});

							$.reset(div);
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