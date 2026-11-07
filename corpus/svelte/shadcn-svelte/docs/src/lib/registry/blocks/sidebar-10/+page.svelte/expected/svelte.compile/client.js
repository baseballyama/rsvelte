import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import AppSidebar from "./components/app-sidebar.svelte";
import NavActions from "./components/nav-actions.svelte";

var root = $.from_html(`<header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3"><!> <!> <!></div> <div class="ms-auto px-3"><!></div></header> <div class="flex flex-1 flex-col gap-4 px-4 py-10"><div class="mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50"></div> <div class="mx-auto h-full w-full max-w-3xl rounded-xl bg-muted/50"></div></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				AppSidebar(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var header = $.first_child(fragment_2);
							var div = $.child(header);
							var node_3 = $.child(div);

							$.component(node_3, () => Sidebar.Trigger, ($$anchor, Sidebar_Trigger) => {
								Sidebar_Trigger($$anchor, {});
							});

							var node_4 = $.sibling(node_3, 2);

							Separator(node_4, {
								orientation: 'vertical',
								class: 'me-2 data-[orientation=vertical]:h-4'
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
								Breadcrumb_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
											Breadcrumb_List($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_7 = $.first_child(fragment_4);

													$.component(node_7, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
														Breadcrumb_Item($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_8 = $.first_child(fragment_5);

																$.component(node_8, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
																	Breadcrumb_Page($$anchor, {
																		class: 'line-clamp-1',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text('Project Management & Task Tracking');

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

							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var node_9 = $.child(div_1);

							NavActions(node_9, {});
							$.reset(div_1);
							$.reset(header);
							$.next(2);
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