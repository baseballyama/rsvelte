import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import { page } from "$app/state";

var root = $.from_html(`<a><!> <span> </span></a>`);

export default function Nav_main($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
					Sidebar_GroupContent($$anchor, {
						class: 'flex flex-col gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
								Sidebar_Menu($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.each(node_3, 17, () => $$props.items, (item) => item.title, ($$anchor, item) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
												Sidebar_MenuItem($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														{
															const child = ($$anchor, $$arg0) => {
																let props = () => ($$arg0?.()).props;
																var a = root();

																$.attribute_effect(a, () => ({ href: $.get(item).url, ...props() }));

																var node_6 = $.child(a);

																$.component(node_6, () => $.get(item).icon, ($$anchor, item_icon) => {
																	item_icon($$anchor, {});
																});

																var span = $.sibling(node_6, 2);
																var text = $.only_child(span, true);

																$.reset(a);
																$.template_effect(() => $.set_text(text, $.get(item).title));
																$.append($$anchor, a);
															};

															let $0 = $.derived(() => page.url.pathname.startsWith($.get(item).url));

															$.component(node_5, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																Sidebar_MenuButton($$anchor, {
																	get tooltipContent() {
																		return $.get(item).title;
																	},

																	get isActive() {
																		return $.get($0);
																	},
																	child,
																	$$slots: { child: true }
																});
															});
														}

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}