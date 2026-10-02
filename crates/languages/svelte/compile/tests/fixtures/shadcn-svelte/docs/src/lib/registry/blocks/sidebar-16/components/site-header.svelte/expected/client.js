import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SidebarIcon from "@lucide/svelte/icons/sidebar";
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";
import SearchForm from "./search-form.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<header class="sticky top-0 z-50 flex w-full items-center border-b bg-background"><div class="flex h-(--header-height) w-full items-center gap-2 px-4"><!> <!> <!> <!></div></header>`);

export default function Site_header($$anchor, $$props) {
	$.push($$props, true);

	const sidebar = Sidebar.useSidebar();
	var header = root_1();
	var div = $.child(header);
	var node = $.child(div);

	Button(node, {
		class: 'size-8',
		variant: 'ghost',
		size: 'icon',
		get onclick() {
			return sidebar.toggle;
		},

		children: ($$anchor, $$slotProps) => {
			SidebarIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Separator(node_1, { orientation: 'vertical', class: 'me-2 h-4' });

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => Breadcrumb.Root, ($$anchor, Breadcrumb_Root) => {
		Breadcrumb_Root($$anchor, {
			class: 'hidden sm:block',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				$.component(node_3, () => Breadcrumb.List, ($$anchor, Breadcrumb_List) => {
					Breadcrumb_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item) => {
								Breadcrumb_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Breadcrumb.Link, ($$anchor, Breadcrumb_Link) => {
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

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_4, 2);

							$.component(node_6, () => Breadcrumb.Separator, ($$anchor, Breadcrumb_Separator) => {
								Breadcrumb_Separator($$anchor, {});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Breadcrumb.Item, ($$anchor, Breadcrumb_Item_1) => {
								Breadcrumb_Item_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_8 = $.first_child(fragment_4);

										$.component(node_8, () => Breadcrumb.Page, ($$anchor, Breadcrumb_Page) => {
											Breadcrumb_Page($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Data Fetching');

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

	var node_9 = $.sibling(node_2, 2);

	SearchForm(node_9, { class: 'w-full sm:ms-auto sm:w-auto' });
	$.reset(div);
	$.reset(header);
	$.append($$anchor, header);
	$.pop();
}