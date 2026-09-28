import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Credit Card`, 1);
var root_1 = $.from_html(`<!> PayPal`, 1);
var root_2 = $.from_html(`<!> Bank Transfer`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_menu_with_radio_icons($$anchor) {
	let paymentMethod = $.state("card");

	Example($$anchor, {
		title: 'Radio with Icons',
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

										var text = $.text('Payment Method');

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
								class: 'min-w-56',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
										DropdownMenu_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_4();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
													DropdownMenu_Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Select Payment Method');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
													DropdownMenu_RadioGroup($$anchor, {
														get value() {
															return $.get(paymentMethod);
														},

														set value($$value) {
															$.set(paymentMethod, $$value, true);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_3();
															var node_6 = $.first_child(fragment_6);

															$.component(node_6, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
																DropdownMenu_RadioItem($$anchor, {
																	value: 'card',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root();
																		var node_7 = $.first_child(fragment_7);

																		IconPlaceholder(node_7, {
																			lucide: 'CreditCardIcon',
																			tabler: 'IconCreditCard',
																			hugeicons: 'CreditCardIcon',
																			phosphor: 'CreditCardIcon',
																			remixicon: 'RiBankCardLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_8 = $.sibling(node_6, 2);

															$.component(node_8, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_1) => {
																DropdownMenu_RadioItem_1($$anchor, {
																	value: 'paypal',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root_1();
																		var node_9 = $.first_child(fragment_8);

																		IconPlaceholder(node_9, {
																			lucide: 'WalletIcon',
																			tabler: 'IconWallet',
																			hugeicons: 'WalletIcon',
																			phosphor: 'WalletIcon',
																			remixicon: 'RiWalletLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_8, 2);

															$.component(node_10, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem_2) => {
																DropdownMenu_RadioItem_2($$anchor, {
																	value: 'bank',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root_2();
																		var node_11 = $.first_child(fragment_9);

																		IconPlaceholder(node_11, {
																			lucide: 'Building2Icon',
																			tabler: 'IconBuildingBank',
																			hugeicons: 'BankIcon',
																			phosphor: 'BankIcon',
																			remixicon: 'RiBankLine'
																		});

																		$.next();
																		$.append($$anchor, fragment_9);
																	},
																	$$slots: { default: true }
																});
															});

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