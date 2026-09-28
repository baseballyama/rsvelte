import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Status Bar`, 1);
var root_1 = $.from_html(`<!> Activity Bar`, 1);
var root_2 = $.from_html(`<!> Panel`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_menu_with_checkboxes($$anchor) {
	let showStatusBar = $.state(true);
	let showActivityBar = $.state(false);
	let showPanel = $.state(false);

	Example($$anchor, {
		title: 'With Checkboxes',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_4();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline', class: 'w-fit' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Checkboxes');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								class: 'min-w-40',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
										DropdownMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_3();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
													DropdownMenu_Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Appearance');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
													DropdownMenu_CheckboxItem($$anchor, {
														get checked() {
															return $.get(showStatusBar);
														},

														set checked($$value) {
															$.set(showStatusBar, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_6 = $.first_child(fragment_6);

															IconPlaceholder(node_6, {
																lucide: 'LayoutIcon',
																tabler: 'IconLayout',
																hugeicons: 'LayoutIcon',
																phosphor: 'LayoutIcon',
																remixicon: 'RiLayoutLine'
															});

															$.next();
															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_5, 2);

												$.component(node_7, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem_1) => {
													DropdownMenu_CheckboxItem_1($$anchor, {
														disabled: true,
														get checked() {
															return $.get(showActivityBar);
														},

														set checked($$value) {
															$.set(showActivityBar, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var node_8 = $.first_child(fragment_7);

															IconPlaceholder(node_8, {
																lucide: 'ActivityIcon',
																tabler: 'IconActivity',
																hugeicons: 'ActivityIcon',
																phosphor: 'PulseIcon',
																remixicon: 'RiPulseLine'
															});

															$.next();
															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_7, 2);

												$.component(node_9, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem_2) => {
													DropdownMenu_CheckboxItem_2($$anchor, {
														get checked() {
															return $.get(showPanel);
														},

														set checked($$value) {
															$.set(showPanel, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_2();
															var node_10 = $.first_child(fragment_8);

															IconPlaceholder(node_10, {
																lucide: 'PanelLeftIcon',
																tabler: 'IconLayoutSidebar',
																hugeicons: 'LayoutLeftIcon',
																phosphor: 'SidebarIcon',
																remixicon: 'RiSideBarLine'
															});

															$.next();
															$.append($$anchor, fragment_8);
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