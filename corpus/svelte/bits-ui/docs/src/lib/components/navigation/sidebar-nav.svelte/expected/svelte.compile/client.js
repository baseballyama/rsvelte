import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollArea } from "bits-ui";
import SidebarNavItems from "$lib/components/navigation/sidebar-nav-items.svelte";
import SidebarNavMainItems from "$lib/components/navigation/sidebar-nav-main-items.svelte";

var root = $.from_html(`<div class="pb-4"><h4 class="text-muted-foreground mb-1 ml-[9px] rounded-md px-2.5 py-2 pl-4 text-xs font-medium uppercase"> </h4> <!></div>`);
var root_1 = $.from_html(`<div class="h-full pb-6 pr-4 pt-4 lg:pb-8"><nav class="space-y-3"><div class="flex w-full flex-col pb-[50px]"></div></nav></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<aside class="border-border fixed top-[var(--header-height)] hidden h-[calc(100vh-var(--header-height))] w-full shrink-0 border-r md:sticky md:block"><!></aside>`);

export default function Sidebar_nav($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var aside = root_3();
			var node_1 = $.child(aside);

			$.component(node_1, () => ScrollArea.Root, ($$anchor, ScrollArea_Root) => {
				ScrollArea_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_2();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => ScrollArea.Viewport, ($$anchor, ScrollArea_Viewport) => {
							ScrollArea_Viewport($$anchor, {
								class: 'h-full max-h-[calc(100vh-var(--header-height))] w-full shrink-0 ',
								children: ($$anchor, $$slotProps) => {
									var div = root_1();
									var nav = $.child(div);
									var div_1 = $.child(nav);

									$.each(div_1, 21, items, $.index, ($$anchor, item) => {
										var fragment_2 = $.comment();
										var node_3 = $.first_child(fragment_2);

										{
											var consequent = ($$anchor) => {
												SidebarNavMainItems($$anchor, {
													get items() {
														return $.get(item).items;
													}
												});
											};

											var alternate = ($$anchor) => {
												var div_2 = root();
												var h4 = $.child(div_2);
												var text = $.only_child(h4, true);
												var node_4 = $.sibling(h4, 2);

												{
													var consequent_1 = ($$anchor) => {
														SidebarNavItems($$anchor, {
															get items() {
																return $.get(item).items;
															}
														});
													};

													$.if(node_4, ($$render) => {
														if ($.get(item).items) $$render(consequent_1);
													});
												}

												$.reset(div_2);
												$.template_effect(() => $.set_text(text, $.get(item).title));
												$.append($$anchor, div_2);
											};

											$.if(node_3, ($$render) => {
												if ($.get(item).title === "Overview") $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_2);
									});

									$.reset(div_1);
									$.reset(nav);
									$.reset(div);
									$.append($$anchor, div);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_2, 2);

						$.component(node_5, () => ScrollArea.Scrollbar, ($$anchor, ScrollArea_Scrollbar) => {
							ScrollArea_Scrollbar($$anchor, {
								orientation: 'vertical',
								class: 'hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none select-none rounded-full border-l border-l-transparent bg-transparent p-px transition-all duration-200 hover:w-3',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_6 = $.first_child(fragment_5);

									$.component(node_6, () => ScrollArea.Thumb, ($$anchor, ScrollArea_Thumb) => {
										ScrollArea_Thumb($$anchor, { class: 'bg-muted-foreground flex-1 rounded-full' });
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_5, 2);

						$.component(node_7, () => ScrollArea.Corner, ($$anchor, ScrollArea_Corner) => {
							ScrollArea_Corner($$anchor, {});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(aside);
			$.append($$anchor, aside);
		};

		$.if(node, ($$render) => {
			if (items().length) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}