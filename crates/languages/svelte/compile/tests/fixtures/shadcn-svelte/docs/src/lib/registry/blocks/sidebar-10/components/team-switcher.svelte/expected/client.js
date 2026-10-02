import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import PlusIcon from "@lucide/svelte/icons/plus";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

var root = $.from_html(`<div class="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground"><!></div> <span class="truncate font-medium"> </span> <!>`, 1);
var root_1 = $.from_html(`<div class="flex size-6 items-center justify-center rounded-sm border"><!></div> <!>`, 1);
var root_2 = $.from_html(`<div class="flex size-6 items-center justify-center rounded-md border bg-background"><!></div> <div class="font-medium text-muted-foreground">Add team</div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Team_switcher($$anchor, $$props) {
	$.push($$props, true);

	// This should be `Component` after @lucide/svelte updates types
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// svelte-ignore state_referenced_locally
	let activeTeam = $.state($.proxy($$props.teams[0]));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
		Sidebar_Menu($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
					Sidebar_MenuItem($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
								DropdownMenu_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_4();
										var node_3 = $.first_child(fragment_3);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
													Sidebar_MenuButton($$anchor, $.spread_props(props, {
														class: 'w-fit px-1.5',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var div = $.first_child(fragment_5);
															var node_5 = $.child(div);

															$.component(node_5, () => $.get(activeTeam).logo, ($$anchor, activeTeam_logo) => {
																activeTeam_logo($$anchor, { class: 'size-3' });
															});

															$.reset(div);

															var span = $.sibling(div, 2);
															var text = $.only_child(span, true);
															var node_6 = $.sibling(span, 2);

															ChevronDownIcon(node_6, { class: 'opacity-50' });
															$.template_effect(() => $.set_text(text, $.get(activeTeam).name));
															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_4);
											};

											$.component(node_3, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
												DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_7 = $.sibling(node_3, 2);

										$.component(node_7, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
											DropdownMenu_Content($$anchor, {
												class: 'w-64 rounded-lg',
												align: 'start',
												side: 'bottom',
												sideOffset: 4,
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_3();
													var node_8 = $.first_child(fragment_6);

													$.component(node_8, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
														DropdownMenu_Label($$anchor, {
															class: 'text-xs text-muted-foreground',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Teams');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.each(node_9, 19, () => $$props.teams, (team) => team.name, ($$anchor, team, index) => {
														var fragment_7 = $.comment();
														var node_10 = $.first_child(fragment_7);

														$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
															DropdownMenu_Item($$anchor, {
																onSelect: () => $.set(activeTeam, $.get(team), true),
																class: 'gap-2 p-2',
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = root_1();
																	var div_1 = $.first_child(fragment_8);
																	var node_11 = $.child(div_1);

																	$.component(node_11, () => $.get(team).logo, ($$anchor, team_logo) => {
																		team_logo($$anchor, { class: 'size-4 shrink-0' });
																	});

																	$.reset(div_1);

																	var text_2 = $.sibling(div_1);
																	var node_12 = $.sibling(text_2);

																	$.component(node_12, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
																		DropdownMenu_Shortcut($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_3 = $.text();

																				$.template_effect(() => $.set_text(text_3, `⌘${$.get(index) + 1}`));
																				$.append($$anchor, text_3);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.template_effect(() => $.set_text(text_2, ` ${$.get(team).name ?? ''} `));
																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													});

													var node_13 = $.sibling(node_9, 2);

													$.component(node_13, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
														DropdownMenu_Separator($$anchor, {});
													});

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
														DropdownMenu_Item_1($$anchor, {
															class: 'gap-2 p-2',
															children: ($$anchor, $$slotProps) => {
																var fragment_10 = root_2();
																var div_2 = $.first_child(fragment_10);
																var node_15 = $.child(div_2);

																PlusIcon(node_15, { class: 'size-4' });
																$.reset(div_2);
																$.next(2);
																$.append($$anchor, fragment_10);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}