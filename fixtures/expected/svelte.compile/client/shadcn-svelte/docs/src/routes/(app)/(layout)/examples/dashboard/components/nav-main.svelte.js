import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Nav_main($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
					Sidebar_GroupContent($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
								Sidebar_GroupLabel($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Home');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
								Sidebar_Menu($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.each(node_4, 17, () => $$props.items, (item) => item.title, ($$anchor, item) => {
											var fragment_4 = $.comment();
											var node_5 = $.first_child(fragment_4);

											$.component(node_5, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
												Sidebar_MenuItem($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_6 = $.first_child(fragment_5);

														$.component(node_6, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
															Sidebar_MenuButton($$anchor, {
																get tooltipContent() {
																	return $.get(item).title;
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root();
																	var node_7 = $.first_child(fragment_6);

																	{
																		var consequent = ($$anchor) => {
																			var fragment_7 = $.comment();
																			var node_8 = $.first_child(fragment_7);

																			$.component(node_8, () => $.get(item).icon, ($$anchor, item_icon) => {
																				item_icon($$anchor, {});
																			});

																			$.append($$anchor, fragment_7);
																		};

																		$.if(node_7, ($$render) => {
																			if ($.get(item).icon) $$render(consequent);
																		});
																	}

																	var span = $.sibling(node_7, 2);
																	var text_1 = $.only_child(span, true);

																	$.template_effect(() => $.set_text(text_1, $.get(item).title));
																	$.append($$anchor, fragment_6);
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
}