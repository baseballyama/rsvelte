import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_menu_radio_group($$anchor) {
	let position = $.state("bottom");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Open');

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
						class: 'w-56',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
								DropdownMenu_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
											DropdownMenu_Label($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Panel Position');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
											DropdownMenu_Separator($$anchor, {});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
											DropdownMenu_RadioGroup($$anchor, {
												get value() {
													return $.get(position);
												},

												set value($$value) {
													$.set(position, $$value, true);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
														DropdownMenu_RadioItem($$anchor, {
															value: 'top',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Top');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
														DropdownMenu_RadioItem_1($$anchor, {
															value: 'bottom',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Bottom');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
														DropdownMenu_RadioItem_2($$anchor, {
															value: 'right',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text('Right');

																$.append($$anchor, text_4);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}