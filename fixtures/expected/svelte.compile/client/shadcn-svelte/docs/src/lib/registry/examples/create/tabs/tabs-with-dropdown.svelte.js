import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">More options</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex items-center justify-between"><!> <!></div> <div class="border style-vega:rounded-lg style-vega:p-6 style-nova:rounded-lg style-nova:p-4 style-lyra:rounded-none style-lyra:p-4 style-maia:rounded-xl style-maia:p-6 style-mira:rounded-md style-mira:p-4 style-luma:rounded-xl style-luma:p-6 style-rhea:rounded-xl style-rhea:p-6"><!> <!> <!></div>`, 1);

export default function Tabs_with_dropdown($$anchor) {
	Example($$anchor, {
		title: 'With Dropdown',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
				Tabs_Root($$anchor, {
					value: 'overview',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var div = $.first_child(fragment_2);
						var node_1 = $.child(div);

						$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
							Tabs_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
										Tabs_Trigger($$anchor, {
											value: 'overview',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Overview');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
										Tabs_Trigger_1($$anchor, {
											value: 'analytics',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Analytics');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
										Tabs_Trigger_2($$anchor, {
											value: 'reports',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Reports');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_1, 2);

						$.component(node_5, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
							DropdownMenu_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_3();
									var node_6 = $.first_child(fragment_4);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;

											Button($$anchor, $.spread_props({ variant: 'ghost', size: 'icon', class: 'size-8' }, props, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var node_7 = $.first_child(fragment_6);

													IconPlaceholder(node_7, {
														lucide: 'MoreHorizontalIcon',
														tabler: 'IconDots',
														hugeicons: 'MoreHorizontalCircle01Icon',
														phosphor: 'DotsThreeOutlineIcon',
														remixicon: 'RiMoreLine'
													});

													$.next(2);
													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											}));
										};

										$.component(node_6, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
											DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
										});
									}

									var node_8 = $.sibling(node_6, 2);

									$.component(node_8, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
										DropdownMenu_Content($$anchor, {
											align: 'end',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_2();
												var node_9 = $.first_child(fragment_7);

												$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
													DropdownMenu_Item($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Settings');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
													DropdownMenu_Item_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Export');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_10, 2);

												$.component(node_11, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
													DropdownMenu_Separator($$anchor, {});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
													DropdownMenu_Item_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Archive');

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

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div);

						var div_1 = $.sibling(div, 2);
						var node_13 = $.child(div_1);

						$.component(node_13, () => Tabs.Content, ($$anchor, Tabs_Content) => {
							Tabs_Content($$anchor, {
								value: 'overview',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('View your dashboard metrics and key performance indicators.');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_13, 2);

						$.component(node_14, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
							Tabs_Content_1($$anchor, {
								value: 'analytics',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Detailed analytics and insights about your data.');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						});

						var node_15 = $.sibling(node_14, 2);

						$.component(node_15, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
							Tabs_Content_2($$anchor, {
								value: 'reports',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Generate and view custom reports.');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_1);
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}